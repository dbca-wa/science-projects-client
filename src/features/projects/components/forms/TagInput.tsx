// Used to input keywords and save them to a parametised state - similar to linkedin skill

import { useColorMode } from "@/shared/utils/theme.utils";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import React, { useEffect, useState } from "react";

interface Props {
  setTagFunction: React.Dispatch<React.SetStateAction<string[]>>;
  preExistingTags?: string[];
}

const TagInput = ({ setTagFunction, preExistingTags }: Props) => {
  // Helpers
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const updateTags = (updatedTags: string[]) => {
    setTagFunction(updatedTags);
    setTags(updatedTags);
  };

  const removeTag = (tag: string) => {
    const updatedTags = tags.filter((t) => t !== tag);
    updateTags(updatedTags);
  };

  // State and Use Effects
  const [isInputActive, setInputActive] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    // console.log(preExistingTags)
    if (preExistingTags?.length >= 1 && preExistingTags[0] !== null) {
      // console.log(preExistingTags.length, preExistingTags);
      if (preExistingTags[0] === "") {
        setTags([]);
      } else {
        const splitTags = preExistingTags[0].split(", ");
        setTags([...splitTags]);
      }
    }
  }, []);

  // Funcs

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isInputActive) {
      // Prevent the default behavior of the Enter key
      event.preventDefault();
      addTags();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const addTags = () => {
    const newTags = inputValue
      .split(", ")
      // .map((tag) => tag.trim())
      .map((tag) => tag.trim().replace(/,$/, ""))
      .filter((tag) => tag !== "")
      .filter(
        (tag) =>
          !tags.some(
            (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
          )
      );

    if (newTags.length > 0) {
      const updatedTags = [...tags, ...newTags.map(capitalizeFirstLetter)];
      updateTags(updatedTags);
    }

    setInputValue("");
  };

  // Variables
  const { colorMode } = useColorMode();

  return (
    <div className="space-y-2 mb-4 relative z-10">
      <Label className="required pb-1">Keywords</Label>
      <div>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Add some keywords..."
          onFocus={() => setInputActive(true)}
          onBlur={() => {
            if (inputValue !== "") {
              addTags();
            }
            setInputActive(false);
          }}
        />
      </div>
      <p className={cn(
        "text-sm",
        colorMode === "light" ? "text-gray-500" : "text-gray-400"
      )}>
        Add some keywords as a comma-separated list. Press enter or click away when you're done to add the tag/s.
      </p>
      <div className="flex flex-wrap gap-2 pt-3">
        {tags?.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={cn(
              "text-white rounded-full cursor-pointer select-none",
              colorMode === "light" 
                ? "bg-blue-500 hover:bg-blue-400" 
                : "bg-blue-600 hover:bg-blue-500"
            )}
          >
            <span className="pl-1">{tag}</span>
            <X
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => removeTag(tag)}
              tabIndex={-1}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
