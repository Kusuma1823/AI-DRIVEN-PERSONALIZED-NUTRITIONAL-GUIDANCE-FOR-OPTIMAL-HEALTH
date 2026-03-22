import React, { useEffect, useRef, useState } from "react";
import type { FoodSearchService } from "../../features/dataset/services/foodSearchService";
import { Input } from "../ui/Input";
import { Chip } from "../ui/Chip";
import { Badge } from "../ui/Badge";
import { extractTextFromImage } from "../ocr/extractTextFromImage";

export function FoodSearchBar(props: {
  service: FoodSearchService;
  onSelectFoodId: (foodId: number) => void;
  placeholder?: string;
  initialQuery?: string;
  enableOCR?: boolean;
}) {
  const { service, onSelectFoodId, placeholder = "Search foods...", initialQuery = "", enableOCR = false } = props;

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Array<{ foodId: number; foodName: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const q = query.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      const list = await service.getSuggestions(q, 6);
      if (cancelled) return;
      setSuggestions(list);
      setOpen(true);
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [query, service]);

  const hasSuggestions = open && suggestions.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Input
          label="Food search"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => {
            // Allow click selection before closing.
            window.setTimeout(() => setOpen(false), 160);
          }}
          hint="Type at least 2 characters to see suggestions."
        />
        {enableOCR ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={ocrBusy}
            className="absolute right-2 top-[38px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-70"
          >
            {ocrBusy ? "OCR..." : "Scan"}
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setOcrBusy(true);
            try {
              const result = await extractTextFromImage({ file });
              if (result.text) {
                // Use extracted text as the new query string.
                setQuery(result.text);
                setOpen(true);
              }
            } finally {
              setOcrBusy(false);
              if (fileRef.current) fileRef.current.value = "";
            }
          }}
        />
      </div>

      {hasSuggestions ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-100 bg-white shadow-soft">
          {loading ? (
            <div className="p-4 text-sm text-gray-600">Searching...</div>
          ) : (
            <div className="max-h-[320px] overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s.foodId}
                  type="button"
                  className="w-full border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectFoodId(s.foodId);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{s.foodName}</div>
                      <div className="mt-1 text-xs text-gray-600">{s.category}</div>
                    </div>
                    <div className="pt-1">
                      <Badge tone="neutral">View</Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Chip tone="neutral">{s.category}</Chip>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

