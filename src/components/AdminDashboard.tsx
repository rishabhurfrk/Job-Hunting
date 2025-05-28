import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JobCard from './JobCard';
import { Plus, LogOut, Briefcase } from 'lucide-react';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_logo: '',
    apply_link: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: '',
    experience_required: '',
  });

  const { signOut, profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingJob) {
        const { error } = await supabase
          .from('job_listings')
          .update(formData)
          .eq('id', editingJob.id);

        if (error) throw error;
        toast({
          title: "Job Updated",
          description: "Job listing has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('job_listings')
          .insert([{
            ...formData,
            created_by: user?.id
          }]);

        if (error) throw error;
        toast({
          title: "Job Posted",
          description: "New job listing has been created successfully.",
        });
      }

      resetForm();
      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company_name: job.company_name,
      company_logo: job.company_logo || '',
      apply_link: job.apply_link,
      description: job.description || '',
      location: job.location || '',
      salary_range: job.salary_range || '',
      job_type: job.job_type || '',
      experience_required: job.experience_required || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      
      toast({
        title: "Job Deleted",
        description: "Job listing has been deleted successfully.",
      });
      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company_name: '',
      company_logo: '',
      apply_link: '',
      description: '',
      location: '',
      salary_range: '',
      job_type: '',
      experience_required: '',
    });
    setEditingJob(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Logo watermark texture */}
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `url('/logo.png')`,
          backgroundSize: '300px auto',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-10deg)',
          filter: 'grayscale(100%)',
          zIndex: 0
        }}
      />
      
      {/* Gradient overlay for depth */}
      <div 
        className="fixed inset-0 w-full h-full opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 0
        }}
      />

      {/* Header */}
      <header className="relative bg-card/95 shadow-sm border-b border-border/20 backdrop-blur-sm z-10">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border/20 nvidia-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{jobs.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 nvidia-glow"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Post New Job'}</span>
          </Button>
        </div>

        {/* Job Form */}
        {showForm && (
          <Card className="mb-8 bg-card border-border/20 nvidia-glow">
            <CardHeader>
              <CardTitle className="text-foreground">
                {editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-muted-foreground">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g. Senior React Developer"
                      className="bg-background border-border/20 nvidia-glow"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      required
                      placeholder="e.g. TechCorp Inc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_logo">Company Logo URL</Label>
                  <Input
                    id="company_logo"
                    value={formData.company_logo}
                    onChange={(e) => setFormData({...formData, company_logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apply_link">Apply Link *</Label>
                  <Input
                    id="apply_link"
                    value={formData.apply_link}
                    onChange={(e) => setFormData({...formData, apply_link: e.target.value})}
                    required
                    placeholder="https://company.com/apply"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Remote, New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                      placeholder="e.g. $80k - $120k"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({...formData, job_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_required">Experience Required</Label>
                    <Input
                      id="experience_required"
                      value={formData.experience_required}
                      onChange={(e) => setFormData({...formData, experience_required: e.target.value})}
                      placeholder="e.g. 2+ years"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            All Job Listings ({jobs.length})
          </h2>
          {jobs.length === 0 ? (
            <Card className="bg-card border-border/20 nvidia-glow">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No job listings yet. Create your first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 justify-center px-2 sm:px-0">
              {jobs.map((job) => (
                <div key={job.id} className="flex justify-center">
                  <JobCard
                    job={job}
                    showAdminActions={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
