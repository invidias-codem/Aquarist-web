import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { createParameterLog } from '../../lib/api';
import type { ParameterType, TankType } from '../../lib/api';
import { toast } from 'sonner';

interface ParameterLoggerProps {
  tankId: string;
  tankType: TankType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogged: () => void;
}

export function ParameterLogger({ tankId, tankType, open, onOpenChange, onLogged }: ParameterLoggerProps) {
  const [submitting, setSubmitting] = useState(false);
  
  // State for form fields
  const [ph, setPh] = useState<string>('');
  const [ammonia, setAmmonia] = useState<string>('');
  const [nitrite, setNitrite] = useState<string>('');
  const [nitrate, setNitrate] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [salinity, setSalinity] = useState<string>('');
  const [alkalinity, setAlkalinity] = useState<string>('');
  const [calcium, setCalcium] = useState<string>('');
  const [magnesium, setMagnesium] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const readings: { parameter_type: ParameterType; value: number; unit: string }[] = [];
      
      const addReading = (val: string, type: ParameterType, unit: string) => {
        if (val !== '') {
          readings.push({ parameter_type: type, value: parseFloat(val), unit });
        }
      };

      addReading(ph, 'ph', 'pH');
      addReading(ammonia, 'ammonia', 'ppm');
      addReading(nitrite, 'nitrite', 'ppm');
      addReading(nitrate, 'nitrate', 'ppm');
      addReading(temperature, 'temperature', 'F');
      
      if (tankType === 'marine' || tankType === 'brackish') {
        addReading(salinity, 'salinity', 'sg');
      }
      if (tankType === 'marine') {
        addReading(alkalinity, 'alkalinity', 'dKH');
        addReading(calcium, 'calcium', 'ppm');
        addReading(magnesium, 'magnesium', 'ppm');
      }

      if (readings.length === 0) {
        toast.error('Please enter at least one parameter to log.');
        setSubmitting(false);
        return;
      }

      await createParameterLog(tankId, new Date().toISOString(), readings);
      toast.success('Water parameters logged successfully');
      
      // Reset form
      setPh(''); setAmmonia(''); setNitrite(''); setNitrate(''); setTemperature('');
      setSalinity(''); setAlkalinity(''); setCalcium(''); setMagnesium('');
      
      onOpenChange(false);
      onLogged();
    } catch (error: any) {
      toast.error('Failed to log parameters: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border sm:max-w-[425px] overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Log Water Parameters</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input id="ph" type="number" step="0.1" value={ph} onChange={e => setPh(e.target.value)} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input id="temperature" type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ammonia">Ammonia (ppm)</Label>
              <Input id="ammonia" type="number" step="0.01" value={ammonia} onChange={e => setAmmonia(e.target.value)} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nitrite">Nitrite (ppm)</Label>
              <Input id="nitrite" type="number" step="0.01" value={nitrite} onChange={e => setNitrite(e.target.value)} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nitrate">Nitrate (ppm)</Label>
              <Input id="nitrate" type="number" step="0.1" value={nitrate} onChange={e => setNitrate(e.target.value)} className="bg-input" />
            </div>

            {(tankType === 'marine' || tankType === 'brackish') && (
              <div className="space-y-2">
                <Label htmlFor="salinity">Salinity (sg)</Label>
                <Input id="salinity" type="number" step="0.001" value={salinity} onChange={e => setSalinity(e.target.value)} className="bg-input" />
              </div>
            )}
            
            {tankType === 'marine' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="alkalinity">Alkalinity (dKH)</Label>
                  <Input id="alkalinity" type="number" step="0.1" value={alkalinity} onChange={e => setAlkalinity(e.target.value)} className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calcium">Calcium (ppm)</Label>
                  <Input id="calcium" type="number" step="1" value={calcium} onChange={e => setCalcium(e.target.value)} className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="magnesium">Magnesium (ppm)</Label>
                  <Input id="magnesium" type="number" step="1" value={magnesium} onChange={e => setMagnesium(e.target.value)} className="bg-input" />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>Save Log</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
