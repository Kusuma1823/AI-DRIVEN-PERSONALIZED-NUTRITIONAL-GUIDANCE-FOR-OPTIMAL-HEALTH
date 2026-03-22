import React, { useState } from "react";
import { extractTextFromImage } from "./extractTextFromImage";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export function OCRImageToText(props: {
  label: string;
  onTextExtracted: (text: string) => void;
}) {
  const { label, onTextExtracted } = props;
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [matchedFoods, setMatchedFoods] = useState<Array<{ name: string; confidence: number }>>([]);

  async function onPick(file: File | null) {
    if (!file) return;
    setBusy(true);
    setProgress("");
    setMatchedFoods([]);
    try {
      const result = await extractTextFromImage({
        file,
        onProgress: (p) => {
          setProgress(p);
        },
      });
      onTextExtracted(result.text);
      if (result.matchedFoods && result.matchedFoods.length > 0) {
        setMatchedFoods(result.matchedFoods);
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-ink-900">{label}</div>
      <div className="mt-2 text-sm text-gray-600">Upload a photo/screenshot of text. OCR will extract and detect foods in our dataset.</div>

      <div className="mt-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          disabled={busy}
          className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-70"
        />
      </div>

      {busy ? (
        <div className="mt-3 text-sm text-gray-700">
          Extracting text... {progress ? <span className="font-semibold">{progress}</span> : null}
        </div>
      ) : null}

      {matchedFoods.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Foods Detected in Dataset:</div>
          <div className="flex flex-wrap gap-2">
            {matchedFoods.map((food, idx) => (
              <Badge key={idx} tone="green" className="text-xs">
                {food.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

