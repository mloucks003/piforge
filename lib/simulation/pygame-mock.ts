export const PYGAME_MODULE = `
import sys, types, time as _time_mod

# ── PiForge pygame mock ────────────────────────────────────────────────────
_display_surface = None
_js_screen = None
_js_touch_getter = None
_touch_events = []
_last_touch_pos = (0, 0)
_mouse_buttons = (False, False, False)
_init_done = False

class _Color:
    def __init__(self, r=0, g=0, b=0):
        if isinstance(r, tuple):
            self.r, self.g, self.b = r[0], r[1], r[2]
        elif isinstance(r, str):
            r = r.lstrip('#')
            self.r = int(r[0:2], 16) if len(r) >= 2 else 0
            self.g = int(r[2:4], 16) if len(r) >= 4 else 0
            self.b = int(r[4:6], 16) if len(r) >= 6 else 0
        else:
            self.r, self.g, self.b = r, g, b

    def __iter__(self):
        return iter((self.r, self.g, self.b))

    def hex(self):
        return '#{:02x}{:02x}{:02x}'.format(self.r, self.g, self.b)

def _to_hex(color):
    if isinstance(color, str):
        return color if color.startswith('#') else '#' + color
    if isinstance(color, (tuple, list)):
        return '#{:02x}{:02x}{:02x}'.format(int(color[0]), int(color[1]), int(color[2]))
    if isinstance(color, _Color):
        return color.hex()
    return '#ffffff'

class Surface:
    def __init__(self, size):
        self.width = int(size[0])
        self.height = int(size[1])
        self._text = None
        self._color = '#ffffff'
        self._fontsize = 12
        self._cmds = []   # deferred draw commands for blit

    def fill(self, color, rect=None):
        if _js_screen:
            if rect is None:
                _js_screen('clear', 0, 0, self.width, self.height, _to_hex(color), 0)
            else:
                r = rect if isinstance(rect, Rect) else Rect(*rect)
                _js_screen('rect', r.x, r.y, r.w, r.h, _to_hex(color), 0)

    def get_size(self):
        return (self.width, self.height)

    def get_width(self):
        return self.width

    def get_height(self):
        return self.height

    def get_rect(self, **kwargs):
        r = Rect(0, 0, self.width, self.height)
        for k, v in kwargs.items():
            setattr(r, k, v)
        return r

    def blit(self, source, pos_or_rect, area=None):
        """Composite source surface onto self at pos, executing stored draw commands."""
        if isinstance(pos_or_rect, Rect):
            dx, dy = pos_or_rect.x, pos_or_rect.y
        elif isinstance(pos_or_rect, (tuple, list)):
            dx, dy = int(pos_or_rect[0]), int(pos_or_rect[1])
        else:
            dx, dy = 0, 0
        # If source has text data, render at (dx, dy)
        if hasattr(source, '_text') and source._text and _js_screen:
            _js_screen('text', dx, dy, source._fontsize, 0, source._color, 0, source._text)
        # Execute any batched draw commands with offset
        if hasattr(source, '_cmds'):
            for cmd in source._cmds:
                if _js_screen:
                    _js_screen(cmd[0], cmd[1]+dx, cmd[2]+dy, cmd[3], cmd[4], cmd[5], cmd[6])

class Rect:
    def __init__(self, x, y, w, h):
        self.x, self.y, self.w, self.h = x, y, w, h
        self.width, self.height = w, h
        self.left, self.top = x, y
        self.right = x + w
        self.bottom = y + h
        self.centerx = x + w // 2
        self.centery = y + h // 2

    def collidepoint(self, x, y=None):
        if isinstance(x, tuple):
            x, y = x
        return self.x <= x <= self.x + self.w and self.y <= y <= self.y + self.h

class _Event:
    def __init__(self, etype, **kwargs):
        self.type = etype
        self.pos = kwargs.get('pos', (0, 0))
        self.button = kwargs.get('button', 0)
        self.key = kwargs.get('key', 0)
        for k, v in kwargs.items():
            setattr(self, k, v)

# Event types
QUIT = 256
KEYDOWN = 768
KEYUP = 769
MOUSEBUTTONDOWN = 1025
MOUSEBUTTONUP = 1026
MOUSEMOTION = 1024
FINGERDOWN = 1792
FINGERUP = 1793

# Key constants
K_ESCAPE = 27
K_RETURN = 13
K_SPACE = 32
K_UP = 273
K_DOWN = 274
K_LEFT = 276
K_RIGHT = 275

class _Display:
    @staticmethod
    def set_mode(size, flags=0):
        global _display_surface
        _display_surface = Surface(size)
        return _display_surface

    @staticmethod
    def set_caption(title):
        pass

    @staticmethod
    def flip():
        pass

    @staticmethod
    def update(rect=None):
        pass

class _Draw:
    @staticmethod
    def rect(surface, color, rect_or_tuple, width=0, border_radius=0):
        if _js_screen:
            if isinstance(rect_or_tuple, Rect):
                r = rect_or_tuple
            elif isinstance(rect_or_tuple, (tuple, list)):
                r = Rect(*rect_or_tuple)
            else:
                return
            _js_screen('rect', r.x, r.y, r.w, r.h, _to_hex(color), border_radius)

    @staticmethod
    def circle(surface, color, center, radius, width=0):
        if _js_screen:
            _js_screen('circle', center[0], center[1], radius, 0, _to_hex(color), 0)

    @staticmethod
    def line(surface, color, start, end, width=1):
        if _js_screen:
            _js_screen('line', start[0], start[1], end[0], end[1], _to_hex(color), width)

class _Font:
    def __init__(self, name, size):
        self.name = name
        self.size = size

    def render(self, text, antialias, color, background=None):
        if _js_screen:
            _js_screen('text', 0, 0, self.size, 0, _to_hex(color), 0, text)
        s = Surface((len(text) * self.size // 2, self.size))
        s._text = text
        s._color = _to_hex(color)
        s._fontsize = self.size
        return s

    def size(self, text):
        return (len(text) * self.size // 2, self.size)

class _FontModule:
    @staticmethod
    def init():
        pass

    @staticmethod
    def Font(name, size):
        return _Font(name, size)

    @staticmethod
    def SysFont(name, size, bold=False, italic=False):
        return _Font(name, size)

class _EventModule:
    @staticmethod
    def _drain_js_touches():
        global _touch_events, _js_touch_getter, _last_touch_pos, _mouse_buttons
        if _js_touch_getter is not None:
            while True:
                e = _js_touch_getter()
                if e is None:
                    break
                x = int(getattr(e, 'x', 0))
                y = int(getattr(e, 'y', 0))
                _last_touch_pos = (x, y)
                _mouse_buttons = (True, False, False)
                _touch_events.append(_Event(MOUSEBUTTONDOWN, pos=(x, y), button=1))

    @staticmethod
    def get():
        global _touch_events, _mouse_buttons
        _EventModule._drain_js_touches()
        events = list(_touch_events)
        _touch_events = []
        # Reset mouse button state after delivering events
        if any(e.type == MOUSEBUTTONDOWN for e in events):
            _mouse_buttons = (False, False, False)
        return events

    @staticmethod
    def poll():
        global _touch_events
        _EventModule._drain_js_touches()
        if _touch_events:
            return _touch_events.pop(0)
        return _Event(0)

    @staticmethod
    def wait():
        _EventModule._drain_js_touches()
        if _touch_events:
            return _touch_events.pop(0)
        return _Event(0)

    @staticmethod
    def pump():
        _EventModule._drain_js_touches()

    @staticmethod
    def clear():
        global _touch_events
        _touch_events = []

class _Mouse:
    @staticmethod
    def get_pos():
        return _last_touch_pos

    @staticmethod
    def get_pressed():
        return _mouse_buttons

    @staticmethod
    def set_visible(visible):
        pass

class _Key:
    @staticmethod
    def get_pressed():
        return {}

    @staticmethod
    def get_mods():
        return 0

class Clock:
    def __init__(self):
        self._last = _time_mod.time()
        self._fps = 0.0

    async def tick(self, framerate=0):
        import asyncio
        now = _time_mod.time()
        elapsed_ms = int((now - self._last) * 1000)
        self._last = now
        if framerate > 0:
            target_ms = 1000.0 / framerate
            if elapsed_ms < target_ms:
                await asyncio.sleep((target_ms - elapsed_ms) / 1000.0)
                elapsed_ms = int(target_ms)
            else:
                # Always yield at least one tick so the browser can breathe
                await asyncio.sleep(0)
        else:
            await asyncio.sleep(0)
        if elapsed_ms > 0:
            self._fps = 1000.0 / elapsed_ms
        return max(elapsed_ms, 1)

    async def tick_busy_loop(self, framerate=0):
        return await self.tick(framerate)

    def get_fps(self):
        return self._fps

    def get_time(self):
        return int((_time_mod.time() - self._last) * 1000)

class _TimeModule:
    Clock = Clock

    @staticmethod
    def get_ticks():
        return int(_time_mod.time() * 1000)

    @staticmethod
    async def delay(ms):
        import asyncio
        await asyncio.sleep(ms / 1000.0)
        return ms

    @staticmethod
    async def wait(ms):
        import asyncio
        await asyncio.sleep(ms / 1000.0)
        return ms

    @staticmethod
    def set_timer(event_type, millis, loops=0):
        pass  # stub

class _Image:
    @staticmethod
    def load(path):
        """Stub — returns a blank surface."""
        return Surface((100, 100))

    @staticmethod
    def save(surface, path):
        pass

    @staticmethod
    def tostring(surface, fmt, flipped=False):
        return b''

    @staticmethod
    def frombuffer(buffer, size, fmt):
        return Surface(size)

class _Transform:
    @staticmethod
    def scale(surface, size):
        s = Surface(size)
        if hasattr(surface, '_text'):
            s._text = surface._text
            s._color = surface._color
            s._fontsize = surface._fontsize
        return s

    @staticmethod
    def rotate(surface, angle):
        return surface

    @staticmethod
    def flip(surface, flip_x, flip_y):
        return surface

    @staticmethod
    def smoothscale(surface, size):
        return _Transform.scale(surface, size)

class _Mixer:
    class Sound:
        def __init__(self, path): pass
        def play(self): pass
        def stop(self): pass
        def set_volume(self, v): pass

    class music:
        @staticmethod
        def load(path): pass
        @staticmethod
        def play(loops=0): pass
        @staticmethod
        def stop(): pass
        @staticmethod
        def set_volume(v): pass
        @staticmethod
        def get_busy(): return False

    @staticmethod
    def init(): pass

    @staticmethod
    def quit(): pass

class _Locals:
    """pygame.locals — commonly imported constants."""
    QUIT = 256
    KEYDOWN = 768
    KEYUP = 769
    MOUSEBUTTONDOWN = 1025
    MOUSEBUTTONUP = 1026
    MOUSEMOTION = 1024
    K_ESCAPE = 27
    K_RETURN = 13
    K_SPACE = 32
    K_UP = 273
    K_DOWN = 274
    K_LEFT = 276
    K_RIGHT = 275
    K_a = 97; K_b = 98; K_c = 99; K_d = 100
    RESIZABLE = 16; FULLSCREEN = 1; NOFRAME = 32
    HWSURFACE = 1; DOUBLEBUF = 2; SRCALPHA = 65536

def init():
    global _init_done
    _init_done = True

def quit():
    global _init_done
    _init_done = False

def get_init():
    return _init_done

def get_error():
    return ''

def _set_js_screen(cb):
    global _js_screen
    _js_screen = cb

def _set_js_touch_getter(fn):
    global _js_touch_getter
    _js_touch_getter = fn

def _add_touch_event(x, y, etype):
    global _touch_events
    _touch_events.append(_Event(etype, pos=(x, y), button=1))

display   = _Display()
draw      = _Draw()
font      = _FontModule()
event     = _EventModule()
mouse     = _Mouse()
key       = _Key()
time      = _TimeModule()
image     = _Image()
transform = _Transform()
mixer     = _Mixer()
locals    = _Locals()

# Make pygame.locals importable via 'from pygame.locals import *'
import sys as _sys
_locals_mod = type(_sys)('pygame.locals')
for _k, _v in vars(_Locals).items():
    if not _k.startswith('_'):
        setattr(_locals_mod, _k, _v)
_sys.modules['pygame.locals'] = _locals_mod
`;
