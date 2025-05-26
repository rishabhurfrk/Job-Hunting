import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Clock, ExternalLink, Briefcase } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company_name: string;
    company_logo?: string;
    apply_link: string;
    description?: string;
    location?: string;
    salary_range?: string;
    job_type?: string;
    created_at: string;
  };
  showAdminActions?: boolean;
  onEdit?: (job: any) => void;
  onDelete?: (jobId: string) => void;
}

const JobCard = ({ job, showAdminActions, onEdit, onDelete }: JobCardProps) => {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-2 border-border/20 bg-card backdrop-blur-md shadow-2xl nvidia-border-gradient nvidia-glow group max-w-2xl w-full">
      <CardHeader className="pb-2 pt-6 px-8 border-0 bg-transparent">
        <div className="flex items-center gap-4">
          {/* Logo in a circle with neon green glow */}
          <div className="w-16 h-16 rounded-full bg-background shadow-lg flex items-center justify-center overflow-hidden border-2 border-border/30 nvidia-glow">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-12 h-12 object-contain p-1 bg-white rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-2xl text-foreground font-poppins whitespace-normal break-words">
              {job.title}
            </h3>
            <p className="text-muted-foreground font-medium font-inter text-base truncate">
              {job.company_name}
            </p>
          </div>
          {showAdminActions && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="nvidia-glow"
                onClick={() => onEdit?.(job)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="nvidia-glow"
                onClick={() => onDelete?.(job.id)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2 pb-6 px-8">
        {job.description && (
          <p className="text-foreground text-base leading-relaxed font-inter opacity-90 line-clamp-3">
            {job.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {job.location && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/30 text-foreground font-semibold shadow-md nvidia-glow"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{job.location}</span>
            </Badge>
          )}
          {job.salary_range && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/30 text-foreground font-semibold shadow-md nvidia-glow"
            >
              <DollarSign className="w-4 h-4 text-primary" />
              <span>{job.salary_range}</span>
            </Badge>
          )}
          {job.job_type && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/30 text-foreground font-semibold shadow-md nvidia-glow"
            >
              <Clock className="w-4 h-4 text-primary" />
              <span>{job.job_type}</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground font-inter">
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
          <Button
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground shadow-md hover:shadow-lg nvidia-glow font-poppins font-bold text-base transition-all duration-200"
            onClick={() => window.open(job.apply_link, '_blank')}
          >
            <span>Apply Now</span>
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
