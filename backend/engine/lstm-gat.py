import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv
from transformers import BertTokenizer, BertForSequenceClassification
from engine.news import fetch_stock_news
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

tokenizer = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
model = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')

class LSTMReturnPredictor(nn.Module):
    def __init__(self, input_dim=5, hidden_dim=64, num_layers=2, output_dim=1):
        super(LSTMReturnPredictor, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # input_dim=5 (Open, High, Low, Close, Volume)
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # We only care about the prediction from the last time step
        out = self.fc(out[:, -1, :])
        return out

class GATStockModule(torch.nn.Module):
    def __init__(self, in_channels, out_channels, heads=4):
        super(GATStockModule, self).__init__()
        # Multi-head attention (4 heads) helps the model see different types 
        # of relationships (e.g., one head for sectors, one for supply chain)
        self.gat1 = GATConv(in_channels, 32, heads=heads, dropout=0.2)
        self.gat2 = GATConv(32 * heads, out_channels, heads=1, concat=False, dropout=0.2)

    def forward(self, x, edge_index):
        # x: Node features (the outputs from your LSTM for each stock)
        # edge_index: The graph structure (which stocks are connected)
        x = self.gat1(x, edge_index)
        x = F.elu(x) # Exponential Linear Unit handles negative returns better than ReLU
        x = self.gat2(x, edge_index)
        return x

class HybridLSTM_GAT(nn.Module):
    def __init__(self, n_stocks, input_dim=5, lstm_hidden=64, gat_out=32):
        super(HybridLSTM_GAT, self).__init__()
        self.n_stocks = n_stocks
        # One LSTM shared across all stocks to learn general market patterns
        self.lstm = LSTMReturnPredictor(input_dim, lstm_hidden)
        
        # GAT takes (LSTM_Hidden + 1 for Sentiment) as input channels
        self.gat = GATStockModule(in_channels=lstm_hidden + 1, out_channels=gat_out)
        
        # Final prediction layer
        self.regressor = nn.Linear(gat_out, 1)

    def forward(self, x_list, sentiment_list, edge_index):
        """
        x_list: List of tensors [Batch, Lookback, Features] for each stock
        sentiment_list: Tensor of sentiment scores [n_stocks]
        """
        # 1. Get temporal features for each stock via LSTM
        lstm_features = []
        for i in range(self.n_stocks):
            # Extract the last hidden state for each stock
            # We bypass the .fc layer of the LSTM to get the raw hidden features
            out, _ = self.lstm.lstm(x_list[i])
            lstm_features.append(out[:, -1, :]) # Shape: [Batch, 64]

        # 2. Combine with sentiment
        # node_features shape: [n_stocks, 65]
        combined_features = []
        for i in range(self.n_stocks):
            s_score = sentiment_list[i].repeat(lstm_features[i].size(0), 1)
            combined_features.append(torch.cat((lstm_features[i], s_score), dim=1))
        
        # Stack into a single graph representation
        # node_x shape: [n_stocks * Batch, 65]
        node_x = torch.cat(combined_features, dim=0)
        
        # 3. Spatial refinement via GAT
        spatial_features = self.gat(node_x, edge_index)
        
        # 4. Final return prediction
        predictions = self.regressor(spatial_features)
        return predictions

def create_node_features(lstm_out, sentiment_score):
    """
    Concatenates the LSTM temporal features with the NLP sentiment score.
    """
    # lstm_out: [64 features], sentiment_score: [1 feature]
    # Resulting node feature vector: [65 features]
    return torch.cat((lstm_out, torch.tensor([sentiment_score])), dim=0)

def get_news_sentiment(headlines: list):
    """
    Takes a list of headlines and returns a mean sentiment score.
    Returns: float (-1.0 to 1.0)
    """
    if not headlines:
        return 0.0 # Neutral if no news found

    # Tokenize and run inference
    inputs = tokenizer(headlines, padding=True, truncation=True, return_tensors="pt")
    outputs = model(**inputs)
    
    # FinBERT outputs: [Neutral, Positive, Negative]
    probs = F.softmax(outputs.logits, dim=-1)
    
    # Calculate a weighted score: Positive - Negative
    # Neutral is ignored in the direction, but dampens the magnitude
    scores = probs[:, 1] - probs[:, 2] 
    return float(scores.mean())

def build_stock_graph(returns_df: pd.DataFrame, threshold=0.5):
    """
    Creates an edge_index where stocks are connected if their 
    historical correlation is higher than the threshold.
    """
    corr_matrix = returns_df.corr().values
    edges = []
    
    num_stocks = len(returns_df.columns)
    for i in range(num_stocks):
        for j in range(num_stocks):
            if i != j and abs(corr_matrix[i, j]) > threshold:
                edges.append([i, j])
    
    # Convert to PyTorch Geometric format [2, num_edges]
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    return edge_index

def prepare_lstm_data(df: pd.DataFrame, lookback=30):
    """
    Converts a DataFrame of OHLCV data into sequences for the LSTM.
    Lookback: 30 days of history to predict the next 5-day return.
    """
    scaler = MinMaxScaler()
    scaled_data = scaler.fit_transform(df)
    
    sequences = []
    for i in range(len(scaled_data) - lookback):
        sequences.append(scaled_data[i : i + lookback])
        
    return torch.tensor(np.array(sequences), dtype=torch.float32), scaler