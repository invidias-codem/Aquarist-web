import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { createTank } from '../lib/api';
import type { TankType, VolumeUnit } from '../lib/api';
import { toast } from 'sonner';

export default function TankForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [tankType, setTankType] = useState<TankType>('freshwater');
  const [volume, setVolume] = useState<number | ''>('');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('gallons');
  const [tempTarget, setTempTarget] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (name.length < 1 || name.length > 100) {
      toast.error('Tank name must be between 1 and 100 characters');
      return;
    }
    
    if (typeof volume !== 'number' || volume <= 0) {
      toast.error('Volume must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await createTank(user.id, {
        name,
        tank_type: tankType,
        volume,
        volume_unit: volumeUnit,
        temp_target: tempTarget === '' ? undefined : tempTarget,
        notes: notes || undefined
      });
      toast.success('Tank created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex items-start justify-center">
      <Card className="w-full max-w-2xl bg-card border-border shadow-lg shadow-black/50 mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Create New Tank</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tank Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Living Room Reef"
                className="bg-input border-border focus-visible:ring-primary"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tank_type">Tank Type <span className="text-destructive">*</span></Label>
                <Select value={tankType} onValueChange={(v) => setTankType(v as TankType)}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freshwater">Freshwater</SelectItem>
                    <SelectItem value="marine">Marine</SelectItem>
                    <SelectItem value="brackish">Brackish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input 
                    id="volume" 
                    type="number" 
                    required 
                    min="0.1" 
                    step="0.1"
                    value={volume}
                    onChange={e => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 50"
                    className="bg-input border-border focus-visible:ring-primary"
                  />
                  <Select value={volumeUnit} onValueChange={(v) => setVolumeUnit(v as VolumeUnit)}>
                    <SelectTrigger className="w-[100px] bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallons">Gallons</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temp_target">Target Temperature (Optional)</Label>
              <Input 
                id="temp_target" 
                type="number" 
                step="0.1"
                value={tempTarget}
                onChange={e => setTempTarget(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 78.5"
                className="bg-input border-border focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Details about setup, substrate, light cycle..."
                className="bg-input border-border focus-visible:ring-primary min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} disabled={loading} className="border-border hover:bg-accent hover:text-accent-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? 'Saving...' : 'Create Tank'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
