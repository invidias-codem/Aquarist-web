import { useEffect, useState } from 'react';
import { getMaintenanceTasks, createMaintenanceTask, completeTask, deleteTask } from '../../lib/api';
import type { MaintenanceTask } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { CheckCircle2, Trash2, CalendarDays } from 'lucide-react';

export function MaintenanceScheduler({ tankId }: { tankId: string }) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('water_change');
  const [recurrence, setRecurrence] = useState('weekly');
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      const data = await getMaintenanceTasks(tankId);
      setTasks(data);
    } catch (e: any) {
      toast.error('Failed to load tasks: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [tankId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const interval = recurrence === 'weekly' ? 7 : recurrence === 'biweekly' ? 14 : recurrence === 'monthly' ? 30 : 0;
      
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + interval);
      
      await createMaintenanceTask({
        tank_id: tankId,
        title,
        task_type: taskType,
        recurrence,
        recurrence_interval_days: interval > 0 ? interval : undefined,
        next_due: nextDue.toISOString().split('T')[0]
      });
      toast.success('Task created successfully');
      setOpen(false);
      setTitle('');
      setTaskType('water_change');
      setRecurrence('weekly');
      loadTasks();
    } catch (e: any) {
      toast.error('Failed to create task: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast.success('Task completed!');
      loadTasks();
    } catch (e: any) {
      toast.error('Failed to complete task: ' + e.message);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
      loadTasks();
    } catch (e: any) {
      toast.error('Failed to delete task: ' + e.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarDays className="h-5 w-5" /> Maintenance Schedule
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setOpen(true)}>+ Add Task</Button>
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Maintenance Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} className="bg-input" placeholder="e.g. 20% Water Change" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_type">Type</Label>
                <Select value={taskType} onValueChange={(v) => { if(v) setTaskType(v); }}>
                  <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water_change">Water Change</SelectItem>
                    <SelectItem value="filter_clean">Filter Cleaning</SelectItem>
                    <SelectItem value="dosing">Dosing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select value={recurrence} onValueChange={(v) => { if(v) setRecurrence(v); }}>
                  <SelectTrigger className="bg-input border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="none">Once</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-md">
            No maintenance tasks scheduled.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {tasks.map(task => {
              const isOverdue = task.next_due < today;
              const isToday = task.next_due === today;
              return (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border ${isOverdue ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/30 border-border'}`}>
                  <div>
                    <h4 className="font-semibold text-foreground">{task.title}</h4>
                    <p className={`text-sm ${isOverdue ? 'text-destructive font-bold' : isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      Due: {new Date(task.next_due).toLocaleDateString()} {isOverdue && '(Overdue)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => handleComplete(task.id)} title="Mark Complete">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(task.id)} title="Delete Task">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
