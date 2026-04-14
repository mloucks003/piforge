export interface DrawCommand {
  type: 'clear' | 'rect' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  extra: number;
  text: string;
}

let _commands: DrawCommand[] = [];
let _version = 0;

export function addDrawCommand(cmd: DrawCommand) {
  if (cmd.type === 'clear') _commands = [cmd];
  else _commands.push(cmd);
  _version++;
}

export function getDrawCommands(): DrawCommand[] {
  return _commands;
}

export function getVersion(): number {
  return _version;
}

export function clearCommands() {
  _commands = [];
  _version++;
}

let _touchCallback: ((x: number, y: number) => void) | null = null;
export function setTouchCallback(cb: (x: number, y: number) => void) { _touchCallback = cb; }
export function sendTouch(x: number, y: number) { _touchCallback?.(x, y); }
