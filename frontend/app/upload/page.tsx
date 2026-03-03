import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <main className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Upload Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Drag & drop or select CSV/Excel file</p>
          <Button>Choose File</Button>
        </CardContent>
      </Card>
    </main>
  );
}