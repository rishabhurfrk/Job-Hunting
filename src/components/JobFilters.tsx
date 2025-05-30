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

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
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