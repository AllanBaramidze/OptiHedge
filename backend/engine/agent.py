# backend/engine/agent.py
import os
import requests
import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# 1. Load the environment variables FIRST
load_dotenv()

# 2. Initialize Groq LLM
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

# 3. Define the State
class PortfolioState(TypedDict):
    holdings: List[Dict[str, Any]]
    metrics: Dict[str, float]
    red_flags: List[str]
    risk_overview: str
    common_hedges: List[str]
    creative_hedges: List[str]
    polymarket_data: List[Dict[str, Any]]
    hypothetical_risks: str
    final_report: str

# --- NODES ---

def detect_red_flags(state: PortfolioState) -> Dict[str, Any]:
    """Node 1: Mathematically analyzes metrics against strict quantitative thresholds."""
    metrics = state.get("metrics", {})
    flags = []
    
    beta = metrics.get("beta", 0.0)
    var = metrics.get("var", 0.0)
    max_dd = metrics.get("max_drawdown", 0.0)
    sharpe = metrics.get("sharpe", 0.0)
    div_score = metrics.get("diversification", 1.0)

    if beta > 1.3:
        flags.append(f"High Market Correlation: Beta is {beta:.2f}. The portfolio is hyper-sensitive to S&P 500 swings.")
    if var < -0.03: 
        flags.append(f"Severe Value at Risk: The portfolio has a projected severe daily downside of {var*100:.2f}%.")
    if max_dd < -0.20: 
        flags.append(f"Deep Historical Drawdown: This asset mix has experienced a severe drop of {max_dd*100:.2f}% in the past year.")
    if sharpe < 1.0:
        flags.append(f"Poor Risk-Adjusted Returns: A Sharpe ratio of {sharpe:.2f} indicates too much volatility for the returns generated.")
    if div_score < 1.2:
        flags.append(f"Concentration Risk: A diversification score of {div_score:.2f} suggests assets are moving in tandem.")

    if not flags:
        flags.append("Portfolio is mathematically sound. Metrics are within normal institutional risk tolerances.")

    return {"red_flags": flags}


def generate_overview(state: PortfolioState) -> Dict[str, Any]:
    """Node 2: Translates the math/red flags into a human-readable executive summary."""
    holdings_list = [h.get("ticker") for h in state.get("holdings", [])]
    flags = state.get("red_flags", [])
    
    prompt = f"""
    You are an elite quantitative risk analyst for a hedge fund.
    I am providing you with the assets in a client's portfolio and a list of mathematical red flags our risk engine caught.
    
    Portfolio Assets: {holdings_list}
    Mathematical Red Flags: {flags}
    
    Write a concise, professional 2-paragraph executive summary of the current portfolio risk. 
    Do not invent new metrics, just explain the provided red flags in a digestible way for a portfolio manager.
    No pleasantries. Get straight to the analysis.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"risk_overview": response.content}


# --- SCHEMAS ---
class HedgeIdeas(BaseModel):
    common_hedges: List[str] = Field(description="1 to 2 traditional financial hedges (e.g., specific Options, inverse ETFs) to mitigate the portfolio risks.")
    creative_hedges: List[str] = Field(description="3 to 5 real-world event themes (e.g., 'Fed rate cut delayed', 'Middle East escalation') that could be traded on prediction markets to offset the risks.")


def generate_hedging_ideas(state: PortfolioState) -> Dict[str, Any]:
    """Node 3: Brainstorms traditional and creative (Polymarket) hedging strategies."""
    overview = state.get("risk_overview", "")
    holdings = [h.get("ticker") for h in state.get("holdings", [])]
    
    prompt = f"""
    You are a brilliant macro-economic strategist for a hedge fund.
    Review the following portfolio and its current risk profile:
    Holdings: {holdings}
    Risk Overview: "{overview}"
    
    Your job is to brainstorm ways to hedge this specific risk.
    1. Suggest 1-2 'common_hedges' using standard financial instruments (e.g., VIX calls, specific sector puts).
    2. Suggest 3-5 'creative_hedges'. These must be real-world geopolitical or macroeconomic events that, if they occur, would negatively impact this portfolio. We will look these up on Polymarket later. Keep the creative event descriptions concise (under 8 words each).
    """
    
    structured_llm = llm.with_structured_output(HedgeIdeas)
    result = structured_llm.invoke([SystemMessage(content=prompt)])
    
    if isinstance(result, dict):
        common = result.get("common_hedges", [])
        creative = result.get("creative_hedges", [])
    else:
        common = getattr(result, "common_hedges", [])
        creative = getattr(result, "creative_hedges", [])
    
    return {
        "common_hedges": common,
        "creative_hedges": creative
    }


def get_token_price(token_id):
    """Helper for Node 4: Fetches live orderbook BUY prices from the CLOB API."""
    if not token_id: return "N/A"
    try:
        r = requests.get("https://clob.polymarket.com/price", params={'token_id': token_id, 'side': 'BUY'})
        price = r.json().get('price', 'None')
        return price if price != "None" else "N/A"
    except:
        return "N/A"


def fetch_polymarket_data(state: PortfolioState) -> Dict[str, Any]:
    """Node 4: Uses the public-search endpoint and enforces strict keyword matching on the market question."""
    creative_hedges = state.get("creative_hedges", [])
    poly_data = []
    GAMMA_API = "https://gamma-api.polymarket.com"
    
    for topic in creative_hedges:
        try:
            # 1. Extract the core keywords from the AI's theme (ignore small words like "the", "in")
            keywords = [kw.lower() for kw in topic.split() if len(kw) > 3]
            
            url = f"{GAMMA_API}/public-search"
            response = requests.get(url, params={"q": topic})
            events = response.json().get('events', [])
            
            matched = False
            for event in events:
                if event.get('closed'): continue 
                
                for market in event.get('markets', []):
                    if market.get('active') and not market.get('closed'):
                        
                        # 2. Grab the specific question for this sub-market
                        question = market.get('question', event.get('title', '')).lower()
                        
                        # 3. THE FIX: Ensure at least one major keyword from our theme is actually in this question!
                        # This skips the "Ukraine" question inside the GTA VI event and finds the "Taiwan" one.
                        if any(kw in question for kw in keywords):
                            
                            tokens = json.loads(market.get('clobTokenIds', '[]'))
                            if tokens:
                                buy_price = get_token_price(tokens[0])
                                
                                if buy_price != "N/A":
                                    poly_data.append({
                                        "theme": topic,
                                        "market_title": market.get('question', event.get('title')),
                                        "url": f"https://polymarket.com/event/{event.get('slug')}",
                                        "yes_price": f"${float(buy_price):.3f}"
                                    })
                                    matched = True
                                    break # Found the exact matching market, stop searching this event
                if matched:
                    break # Found a valid event, move to the next AI topic
            
            if not matched:
                poly_data.append({
                    "theme": topic,
                    "market_title": "No liquid market currently available.",
                    "url": "N/A",
                    "yes_price": "N/A"
                })
                
        except Exception as e:
            print(f"Polymarket API Error for {topic}: {e}")
            poly_data.append({
                "theme": topic,
                "market_title": "Error fetching data.",
                "url": "N/A",
                "yes_price": "N/A"
            })
            
    return {"polymarket_data": poly_data}

def calculate_hypothetical_risk(state: PortfolioState) -> Dict[str, Any]:
    """Node 5: Estimates the quantitative impact of the proposed hedges."""
    metrics = state.get("metrics", {})
    common = state.get("common_hedges", [])
    poly_data = [d["theme"] for d in state.get("polymarket_data", []) if d["yes_price"] != "N/A"]
    
    prompt = f"""
    You are a quantitative risk modeler.
    Current Portfolio Metrics: Beta: {metrics.get('beta')}, VaR: {metrics.get('var')}, Sharpe: {metrics.get('sharpe')}.
    Proposed Hedges: {common} and macro events: {poly_data}.
    
    If the client deployed 10% of their capital into a mix of these hedges, estimate the directional impact on the portfolio's Beta and VaR. 
    Write a single, highly analytical paragraph explaining how much the Beta might drop and how the VaR curve would flatten. Use estimated numbers (e.g., "Beta would likely compress from 2.15 to ~1.4").
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"hypothetical_risks": response.content}

def compile_final_report(state: PortfolioState) -> Dict[str, Any]:
    """Node 6: Synthesizes the entire pipeline into a clean Markdown report."""
    overview = state.get("risk_overview", "")
    common = state.get("common_hedges", [])
    poly_data = state.get("polymarket_data", [])
    hypo_risk = state.get("hypothetical_risks", "")
    
    # Format Polymarket data into a nice string
    poly_str = ""
    for p in poly_data:
        if p["yes_price"] != "N/A":
            poly_str += f"- **{p['theme']}**: [{p['market_title']}]({p['url']}) | Current Probability: {p['yes_price']}\n"
        else:
            poly_str += f"- **{p['theme']}**: No liquid market currently available.\n"
            
    common_str = "\n".join([f"- {h}" for h in common])
    
    prompt = f"""
    You are the Head of Risk Management at a top-tier hedge fund.
    Take the following raw data and format it into a stunning, highly professional Markdown executive report.
    
    Data to include:
    1. Risk Overview: {overview}
    2. Traditional Hedges: {common_str}
    3. Asymmetric Event Hedges (Polymarket): {poly_str}
    4. Projected Post-Hedge Risk: {hypo_risk}
    
    Format requirements:
    - Use clean Markdown headings (e.g., ## 1. Current Risk Profile).
    - Ensure the Polymarket links are clickable markdown links.
    - Keep the tone authoritative, quantitative, and concise.
    - Do not add conversational fluff at the beginning or end. Output ONLY the markdown report.
    """
    
    response = llm.invoke([SystemMessage(content=prompt)])
    return {"final_report": response.content}


# --- GRAPH COMPILATION ---

workflow = StateGraph(PortfolioState)

# 1. Add ALL nodes first
workflow.add_node("analyzer", detect_red_flags)
workflow.add_node("overview", generate_overview)
workflow.add_node("ideation", generate_hedging_ideas)
workflow.add_node("polymarket", fetch_polymarket_data)
workflow.add_node("hypothetical_risk", calculate_hypothetical_risk) 
workflow.add_node("reporter", compile_final_report)                 

# 2. Connect the edges in order
workflow.set_entry_point("analyzer")
workflow.add_edge("analyzer", "overview")
workflow.add_edge("overview", "ideation")             
workflow.add_edge("ideation", "polymarket")
workflow.add_edge("polymarket", "hypothetical_risk")                
workflow.add_edge("hypothetical_risk", "reporter")                  
workflow.add_edge("reporter", END) # Only the reporter goes to END                  

optihedge_chain = workflow.compile()


# --- LOCAL TESTING BLOCK ---
if __name__ == "__main__":
    print("\n--- INITIATING LANGGRAPH TEST ---")
    print("Simulating a high-risk portfolio pass-through...\n")
    
    test_state: PortfolioState = {
        "holdings": [{"ticker": "AAPL"}, {"ticker": "TSLA"}, {"ticker": "SPY (PUT)"}],
        "metrics": {
            "beta": 2.15,
            "var": -0.0558,
            "max_drawdown": -0.2285,
            "sharpe": 1.12,
            "diversification": 1.05
        },
        "red_flags": [],
        "risk_overview": "",
        "common_hedges": [],
        "creative_hedges": [],
        "polymarket_data": [],
        "hypothetical_risks": "",
        "final_report": ""
    }
    
    # Run the graph
    result = optihedge_chain.invoke(test_state)
    
    print("\n========================================================")
    print("🚀 OPTIHEDGE FINAL AI REPORT GENERATED")
    print("========================================================\n")
    print(result.get("final_report", "Report generation failed."))
    print("\n========================================================\n")
    