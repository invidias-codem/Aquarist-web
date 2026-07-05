import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { getTanks, getActiveAlertsForUser, getOverdueTasksCountForUser, getLivestockForTank, getTelemetryForTank } from '../lib/api';
import type { Tank } from '../lib/api';
import { toast } from 'sonner';

interface DashboardTank extends Tank {
  activeAlerts: number;
  tasksOverdue: number;
  livestockCount: number;
  lastLogText: string;
}

export default function Dashboard() {
  const { session, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tanks, setTanks] = useState<DashboardTank[]>([]);
  const [loading, setLoading] = useState(true);

  if (!session || !user) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const loadTanks = async () => {
    try {
      setLoading(true);
      const data = await getTanks(user.id);
      const activeAlertsData = await getActiveAlertsForUser();
      const overdueTasksData = await getOverdueTasksCountForUser();
      
      const mappedTanks: DashboardTank[] = await Promise.all(data.map(async (t) => {
        const tankAlerts = activeAlertsData.filter((a: any) => a.tank_id === t.id).length;
        const tankOverdue = overdueTasksData.filter((task: any) => task.tank_id === t.id).length;
        
        const livestock = await getLivestockForTank(t.id);
        const telemetry = await getTelemetryForTank(t.id);
        
        let lastLogText = 'No logs yet';
        if (telemetry.logs.length > 0) {
           const latest = new Date(Math.max(...telemetry.logs.map((l: any) => new Date(l.created_at).getTime())));
           const diffDays = Math.floor((new Date().getTime() - latest.getTime()) / (1000 * 60 * 60 * 24));
           if (diffDays === 0) lastLogText = 'Today';
           else if (diffDays === 1) lastLogText = 'Yesterday';
           else lastLogText = `${diffDays} days ago`;
        }

        return {
          ...t,
          activeAlerts: tankAlerts,
          tasksOverdue: tankOverdue,
          livestockCount: livestock.length,
          lastLogText: lastLogText
        };
      }));

      // Sort logic: Alerts/Tasks to the top
      mappedTanks.sort((a, b) => {
        const aHasIssues = a.activeAlerts > 0 || a.tasksOverdue > 0;
        const bHasIssues = b.activeAlerts > 0 || b.tasksOverdue > 0;
        if (aHasIssues && !bHasIssues) return -1;
        if (!aHasIssues && bHasIssues) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setTanks(mappedTanks);
    } catch (error: any) {
      toast.error('Failed to load tanks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTanks();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Aquarist Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your aquatic systems</p>
        </div>
        <div className="flex gap-4">
          <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/tanks/new')}>
            + New Tank
          </Button>
          <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-accent hover:text-accent-foreground">
            Sign Out
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <p className="text-muted-foreground">Loading your tanks...</p>
        </div>
      ) : tanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-24 border border-dashed border-border rounded-xl bg-card/50">
          <h2 className="text-2xl font-bold mb-2">No Active Tanks</h2>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            You haven't added any aquariums yet. Set up your first tank to start tracking water chemistry and scheduling maintenance.
          </p>
          <Button size="lg" className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/tanks/new')}>
            Create Your First Tank
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tanks.map(tank => (
            <Link key={tank.id} to={`/tanks/${tank.id}`} className="block group">
              <div className={`p-6 rounded-lg border bg-card text-card-foreground shadow-md transition-all hover:shadow-lg hover:border-primary/50 ${
                (tank.activeAlerts > 0 || tank.tasksOverdue > 0) ? 'border-destructive/80 shadow-[0_0_15px_rgba(127,29,29,0.3)]' : 'border-border'
              }`}>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">{tank.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{tank.tank_type} • {tank.volume} {tank.volume_unit}</p>
                  </div>
                  {(tank.activeAlerts > 0 || tank.tasksOverdue > 0) && (
                    <span className="flex h-3 w-3 rounded-full bg-destructive animate-pulse"></span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Alerts</span>
                    <span className={`text-lg font-bold ${tank.activeAlerts > 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {tank.activeAlerts}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Tasks Overdue</span>
                    <span className={`text-lg font-bold ${tank.tasksOverdue > 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {tank.tasksOverdue}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Livestock</span>
                    <span className="text-lg font-bold">{tank.livestockCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Last Log</span>
                    <span className="text-lg font-bold">{tank.lastLogText}</span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
