import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  GraduationCap,
  Wallet,
  Tags,
  Check,
  X,
} from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";

// Define job-specific filter types
export enum FilterType {
  JOB_TYPE = "Job Type",
  COMPANY = "Company",
  LOCATION = "Location",
  EXPERIENCE = "Experience",
  SALARY = "Salary Range",
  SKILLS = "Skills",
}

export enum FilterOperator {
  IS = "is",
  IS_NOT = "is not",
  INCLUDES = "includes",
  EXCLUDES = "excludes",
}

// Define options for each filter type
export const JobTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
];

export const LocationOptions = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Noida",
  "Gurgaon",
  "Ahmedabad",
];

// Helper function to extract years from experience string
export const extractYearsFromExperience = (exp: string): { min: number; max: number } => {
  const normalized = normalizeExperience(exp);
  
  // Handle empty or invalid input
  if (!normalized) {
    return { min: 0, max: 0 };
  }

  // Check for explicit numerical mentions first
  const numbersOnlyString = normalized.replace(/[^\d.+\- ]/g, ' ').trim();
  let explicitMinMax = null;

  if (numbersOnlyString) {
    // Handle "X+ years" format explicitly if numbers are present
    if (numbersOnlyString.includes('+')) {
      const years = parseFloat(numbersOnlyString);
      if (!isNaN(years)) explicitMinMax = { min: years, max: Number.POSITIVE_INFINITY };
    }
    
    // Handle range format "X-Y years" or "X to Y years" if numbers are present
    if (!explicitMinMax) {
      const rangeMatch = numbersOnlyString.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        if(!isNaN(min) && !isNaN(max)) explicitMinMax = { min, max };
      }
    }
    
    // Handle single number format (e.g., "2 years") if numbers are present
    if (!explicitMinMax) {
      const singleMatch = numbersOnlyString.match(/(\d+(?:\.\d+)?)/);
      if (singleMatch) {
        const years = parseFloat(singleMatch[1]);
        if(!isNaN(years)) explicitMinMax = { min: years, max: years };
      }
    }
  }

  // If explicit numbers are found and valid, prioritize them
  if (explicitMinMax) {
    return explicitMinMax;
  }

  // Keyword check for entry-level/intern roles if no valid explicit numbers were found
  const entryLevelKeywords = ["intern", "internship", "entry level", "fresher", "trainee", "graduate trainee", "junior"];
  const isEntryLevel = entryLevelKeywords.some(keyword => normalized.includes(keyword));

  if (isEntryLevel) {
    return { min: 0, max: 1 }; // Default to 0-1 years for these keywords
  }
  
  // Fallback if no numbers or keywords are matched (should be rare with good normalization)
  return { min: 0, max: 0 };
};

// Helper function to normalize experience strings
export const normalizeExperience = (exp: string): string => {
  if (!exp) return '';
  
  return exp.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/years?/gi, 'years')
    .replace(/yr?s?/gi, 'years')
    .replace(/experience/gi, '')
    .replace(/required/gi, '')
    .trim();
};

// Helper function to check if a job experience matches the filter
export const matchesExperience = (jobExp: string, filterExp: string): boolean => {
  if (!jobExp || !filterExp) return false;
  
  const normalizedJobExp = normalizeExperience(jobExp);
  const normalizedFilterExp = normalizeExperience(filterExp);
  
  const jobYears = extractYearsFromExperience(normalizedJobExp);
  const filterYears = extractYearsFromExperience(normalizedFilterExp);
  
  // For debugging
  console.log('Job Experience:', {
    original: jobExp,
    normalized: normalizedJobExp,
    years: jobYears
  });
  console.log('Filter Experience:', {
    original: filterExp,
    normalized: normalizedFilterExp,
    years: filterYears
  });
  
  // Check if ranges overlap
  const hasOverlap = (
    jobYears.min <= filterYears.max && 
    jobYears.max >= filterYears.min
  );
  
  console.log('Match result:', hasOverlap);
  return hasOverlap;
};

export const ExperienceOptions = [
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
  "6-7 Years",
  "7-8 Years",
  "8-9 Years",
  "9-10 Years",
  "10-12 Years",
  "12-15 Years",
  "15-20 Years",
  "20+ Years"
];

export const SalaryRanges = [
  "0-3 LPA",
  "3-6 LPA",
  "6-10 LPA",
  "10-15 LPA",
  "15-25 LPA",
  "25+ LPA",
];

export const SkillOptions = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "AWS",
  "DevOps",
  "UI/UX",
  "Product Management",
];

export type FilterOption = {
  name: string;
  icon?: React.ReactNode;
};

export type JobFilter = {
  id: string;
  type: FilterType;
  operator: FilterOperator;
  value: string[];
};

const FilterIcon = ({ type }: { type: FilterType }) => {
  switch (type) {
    case FilterType.JOB_TYPE:
      return <Briefcase className="h-4 w-4" />;
    case FilterType.COMPANY:
      return <Building2 className="h-4 w-4" />;
    case FilterType.LOCATION:
      return <MapPin className="h-4 w-4" />;
    case FilterType.EXPERIENCE:
      return <GraduationCap className="h-4 w-4" />;
    case FilterType.SALARY:
      return <Wallet className="h-4 w-4" />;
    case FilterType.SKILLS:
      return <Tags className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const filterViewOptions: FilterOption[] = [
  {
    name: FilterType.JOB_TYPE,
    icon: <FilterIcon type={FilterType.JOB_TYPE} />,
  },
  {
    name: FilterType.LOCATION,
    icon: <FilterIcon type={FilterType.LOCATION} />,
  },
  {
    name: FilterType.EXPERIENCE,
    icon: <FilterIcon type={FilterType.EXPERIENCE} />,
  },
  {
    name: FilterType.SALARY,
    icon: <FilterIcon type={FilterType.SALARY} />,
  },
  {
    name: FilterType.SKILLS,
    icon: <FilterIcon type={FilterType.SKILLS} />,
  },
];

const FilterValueCombobox = ({
  type,
  values,
  options,
  onChange,
}: {
  type: FilterType;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter options based on search - case insensitive
  const filteredOptions = options.filter(option =>
    normalizeExperience(option).includes(normalizeExperience(search))
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 px-3 py-1 bg-muted hover:bg-muted/80 rounded-sm text-sm">
        {values.length === 0 ? (
          <span className="text-muted-foreground">Select {type}</span>
        ) : (
          <span>{values.length} selected</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${type.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onChange(
                      values.includes(option)
                        ? values.filter((v) => v !== option)
                        : [...values, option]
                    );
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={values.includes(option)} />
                    <span>{option}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function JobFilters({
  filters,
  setFilters,
}: {
  filters: JobFilter[];
  setFilters: Dispatch<SetStateAction<JobFilter[]>>;
}) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-background/95 backdrop-blur-sm border rounded-lg shadow-sm">
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="flex items-center gap-1 text-sm bg-muted rounded-sm"
        >
          <div className="flex items-center gap-2 px-3 py-1">
            <FilterIcon type={filter.type} />
            <span>{filter.type}</span>
          </div>
          <FilterValueCombobox
            type={filter.type}
            values={filter.value}
            options={
              filter.type === FilterType.JOB_TYPE
                ? JobTypeOptions
                : filter.type === FilterType.LOCATION
                ? LocationOptions
                : filter.type === FilterType.EXPERIENCE
                ? ExperienceOptions
                : filter.type === FilterType.SALARY
                ? SalaryRanges
                : filter.type === FilterType.SKILLS
                ? SkillOptions
                : []
            }
            onChange={(values) => {
              setFilters((prev) =>
                prev.map((f) =>
                  f.id === filter.id ? { ...f, value: values } : f
                )
              );
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setFilters((prev) => prev.filter((f) => f.id !== filter.id));
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}