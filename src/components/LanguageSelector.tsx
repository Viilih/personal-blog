"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for the languages object
interface Languages {
  [key: string]: string;
}

interface LanguageSelectorProps {
  languages: Languages;
  currentLang: string;
}

export default function LanguageSelector({
  languages,
  currentLang,
}: LanguageSelectorProps) {
  const handleLanguageChange = (value: string) => {
    window.location.href = `/${value}/`;
  };

  return (
    <div className="flex items-center">
      <Select defaultValue={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder={languages[currentLang]} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languages).map(([lang, label]) => (
            <SelectItem key={lang} value={lang}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
