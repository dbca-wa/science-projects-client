import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { KeywordTag } from "@/shared/types/index.d";
import React, { useState } from "react";
import type {
  ControllerRenderProps,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface StaffKeywordManagerProps<T> {
  field: ControllerRenderProps<T, Path<T>>;
  registerFn: UseFormRegister<T>; // Function for validating / updating when editing
}

const StaffKeywordManager = <T,>({
  field,
  registerFn: register,
}: StaffKeywordManagerProps<T>) => {
  const [inputValue, setInputValue] = useState("");
  const [localKeywords, setLocalKeywords] = useState<KeywordTag[]>(() => {
    // Initialize localKeywords with the initial field value
    return Array.isArray(field.value) ? field.value : [];
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "," || e.key === "Enter") && inputValue.trim() !== "") {
      e.preventDefault(); // Prevent form submission on Enter and prevent adding comma
      addKeyword(inputValue.trim());
    }
  };

  const addKeyword = (keywordName: string) => {
    const normalizedKeywordName = keywordName.toLowerCase();
    const newKeyword: KeywordTag = {
      pk: Math.random(), // Temporary pk for the frontend; replace with backend-generated pk on save
      name: normalizedKeywordName,
    };
    if (!localKeywords.some((kw) => kw.name === normalizedKeywordName)) {
      const updatedKeywords = [...localKeywords, newKeyword];
      setLocalKeywords(updatedKeywords);
      field.onChange(updatedKeywords); // Update form state
    }
    setInputValue("");
  };

  const removeKeyword = (keywordToRemove: KeywordTag) => {
    const updatedKeywords = localKeywords.filter(
      (keyword) => keyword.name !== keywordToRemove.name,
    );
    setLocalKeywords(updatedKeywords);
    field.onChange(updatedKeywords); // Update form state
  };

  return (
    <div>
      <input
        type="hidden"
        value={localKeywords.join(",")}
        {...register(field.name)} // Register the hidden input
      />
      <div className="mb-2 flex flex-wrap gap-2">
        {localKeywords.map((keyword, index) => (
          <div
            key={index}
            className="flex items-center rounded bg-blue-500 px-2 py-1 text-white"
          >
            {keyword.name}
            <Button
              type="button"
              variant="link"
              className="ml-2 text-white"
              onClick={() => removeKeyword(keyword)}
            >
              x
            </Button>
          </div>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Add a keyword and press comma or enter"
      />
    </div>
  );
};

export default StaffKeywordManager;
