import { System } from '../system';
import { Viewer } from './viewer';

export type Context = {
  system: System;
  viewer: Viewer;
  sha: string;
};
