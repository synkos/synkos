import { startWorker } from '@synkos/server';
import { applyExtensions } from '@/bootstrap/extensions';
import { registerListeners } from '@/bootstrap/listeners';
import { wireAdapters } from '@/bootstrap/adapters';
import { registerJobs, scheduleJobs } from '@/bootstrap/jobs';

startWorker({
  extensions: applyExtensions,
  listeners: registerListeners,
  adapters: wireAdapters,
  registerJobs,
  scheduleJobs,
});
