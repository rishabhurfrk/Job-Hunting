import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import JobCard from './JobCard';
import { Search, Briefcase, LogOut, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JobFilters, FilterType, FilterOperator, JobFilter } from './JobFilters';
import { nanoid } from 'nanoid';

// Helper function to group jobs by date
const groupJobsByDate = (jobs: any[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  return jobs.reduce((groups: any, job: any) => {
    const jobDate = new Date(job.created_at);
    jobDate.setHours(0, 0, 0, 0);

    if (jobDate.getTime() === today.getTime()) {
      if (!groups.today) groups.today = [];
      groups.today.push(job);
    } else if (jobDate.getTime() === yesterday.getTime()) {
      if (!groups.yesterday) groups.yesterday = [];
      groups.yesterday.push(job);
    } else if (jobDate > weekAgo) {
      if (!groups.thisWeek) groups.thisWeek = [];
      groups.thisWeek.push(job);
    } else if (jobDate > monthAgo) {
      if (!groups.thisMonth) groups.thisMonth = [];
      groups.thisMonth.push(job);
    } else {
      if (!groups.earlier) groups.earlier = [];
      groups.earlier.push(job);
    }
    return groups;
  }, {});
};

const UserDashboard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [jobFilters, setJobFilters] = useState<JobFilter[]>([]);
  console.log('UserDashboard rendering. showFilters is currently:', showFilters);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string[]>([]);
  const [jobTypeFilter, setJobTypeFilter] = useState<string[]>([]);
  const [salaryFilter, setSalaryFilter] = useState<string[]>([]);
  
  // Unique filter options
  const [locations, setLocations] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<string[]>([]);

  const { signOut, profile } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Extract unique filter options from jobs
    if (jobs.length > 0) {
      console.log('Jobs data:', jobs);
      
      const uniqueLocations = [...new Set(jobs.filter(job => job.location).map(job => job.location.trim()))];
      console.log('Unique locations:', uniqueLocations);
      setLocations(uniqueLocations);
      
      const uniqueExperiences = [...new Set(jobs.filter(job => job.experience_required).map(job => job.experience_required))];
      console.log('Unique experiences:', uniqueExperiences);
      setExperiences(uniqueExperiences);
      
      const uniqueJobTypes = [...new Set(jobs.filter(job => job.job_type).map(job => job.job_type))];
      console.log('Unique job types:', uniqueJobTypes);
      setJobTypes(uniqueJobTypes);
      
      const uniqueSalaryRanges = [...new Set(jobs.filter(job => job.salary_range).map(job => job.salary_range))];
      console.log('Unique salary ranges:', uniqueSalaryRanges);
      setSalaryRanges(uniqueSalaryRanges);
    }
  }, [jobs]);

  useEffect(() => {
    // Filter jobs based on search term and filters
    let filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply job filters
    jobFilters.forEach(filter => {
      if (filter.value.length > 0) {
        switch (filter.type) {
          case FilterType.JOB_TYPE:
            filtered = filtered.filter(job => filter.value.includes(job.job_type));
            break;
          case FilterType.LOCATION:
            filtered = filtered.filter(job => 
              filter.value.some(location => 
                job.location?.toLowerCase().includes(location.toLowerCase())
              )
            );
            break;
          case FilterType.EXPERIENCE:
            filtered = filtered.filter(job => 
              filter.value.includes(job.experience_required)
            );
            break;
          case FilterType.SALARY:
            filtered = filtered.filter(job => 
              filter.value.includes(job.salary_range)
            );
            break;
          case FilterType.SKILLS:
            filtered = filtered.filter(job =>
              filter.value.every(skill =>
                job.skills?.toLowerCase().includes(skill.toLowerCase())
              )
            );
            break;
        }
      }
    });

    setFilteredJobs(filtered);
  }, [searchTerm, jobs, jobFilters]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched jobs:', data);
      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    console.log('Resetting filters');
    setLocationFilter([]);
    setExperienceFilter([]);
    setJobTypeFilter([]);
    setSalaryFilter([]);
  };

  // Group jobs by date
  const groupedJobs = groupJobsByDate(filteredJobs);

  // Helper function to render job group
  const renderJobGroup = (jobs: any[], title: string) => {
    if (!jobs?.length) return null;
    
    return (
      <div key={title} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 justify-center px-2 sm:px-0">
          {jobs.map((job) => (
            <div key={job.id} className="flex justify-center w-full">
              <JobCard 
                job={job} 
                showAdminActions={false}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleLocationChange = (loc) => {
    setLocationFilter(prev =>
      prev.includes(loc)
        ? prev.filter(l => l !== loc)
        : [...prev, loc]
    );
  };

  const addFilter = (type: FilterType) => {
    setJobFilters(prev => [
      ...prev,
      {
        id: nanoid(),
        type,
        operator: FilterOperator.IS,
        value: [],
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Logo watermark texture */}
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.07]"
        style={{
          backgroundImage: `url('/logo.png')`,
          backgroundSize: '300px auto',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-10deg)',
          filter: 'grayscale(100%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div 
        className="fixed inset-0 w-full h-full opacity-40"
        style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header className="relative bg-card/95 shadow-sm border-b border-border/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="The Job Hunter"
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || profile?.email}
              </span>
              <Button variant="outline" className="nvidia-glow" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Find Your Dream Job
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Discover amazing opportunities from top companies
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search jobs, companies, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-card border-border/20 nvidia-glow"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <div className="flex justify-center mb-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-2 nvidia-glow"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {/* Filters Section */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-6">
              <JobFilters filters={jobFilters} setFilters={setJobFilters} />
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.values(FilterType).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addFilter(type)}
                    className="text-xs"
                    disabled={jobFilters.some(f => f.type === type)}
                  >
                    + Add {type}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredJobs.length}</div>
              <p className="text-xs text-muted-foreground">
                {searchTerm ? `Matching "${searchTerm}"` : 'Total positions'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(filteredJobs.map(job => job.company_name)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Hiring now
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Week</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredJobs.filter(job => {
                  const jobDate = new Date(job.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return jobDate > weekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Fresh opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">
              {searchTerm ? `Search Results (${filteredJobs.length})` : 'Latest Jobs'}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? `No jobs found matching "${searchTerm}"` : 'No jobs available yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {renderJobGroup(groupedJobs.today, 'Today')}
              {renderJobGroup(groupedJobs.yesterday, 'Yesterday')}
              {renderJobGroup(groupedJobs.thisWeek, 'This Week')}
              {renderJobGroup(groupedJobs.thisMonth, 'This Month')}
              {renderJobGroup(groupedJobs.earlier, 'Earlier')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
