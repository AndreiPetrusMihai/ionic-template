export interface RoadProps {
  id?: number;
  name: string;
  lanes?: number;
  isOperational?: boolean;
  lastMaintained?: Date;
  version?: number;
  createdOnFrontend?: boolean;
  base64Photo?: string;
  lat?: number;
  long?: number;
}
