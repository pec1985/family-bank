'use client';
import BrandLogo from '../components/BrandLogo';
import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import ChecklistRounded from '@mui/icons-material/ChecklistRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import LockRounded from '@mui/icons-material/LockRounded';

import { memberAvatars } from '@/lib/member-names';

type Goal = { id?: number; name: string; icon: string; balanceCents?: number };
type Member = {
  id: number;
  name: string;
  avatar: string;
  age: number | null;
  cashCents: number;
  investmentCents: number;
  investments: Goal[];
};
type Task = { id?: number; title: string; description: string; amountCents: number; icon: string };
export default function AdminPage() {
  const [section, setSection] = useState<'profiles' | 'tasks' | 'investment' | 'access'>(
      'profiles',
    ),
    [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null),
    [emojiTarget, setEmojiTarget] = useState<
      | { kind: 'task'; taskIndex: number }
      | { kind: 'goal'; memberIndex: number; goalIndex: number }
      | null
    >(null);
  const taskEmojis = Array.from(
    new Set([
      '✨',
      '🧹',
      '🧺',
      '🍽️',
      '🛏️',
      '📚',
      '🐾',
      '🌿',
      '🎨',
      '🧸',
      '🚲',
      '⭐',
      '🪥',
      '🧼',
      '🧦',
      '🧩',
      '🗑️',
      '🪴',
      '🧽',
      '🎒',
      '🥣',
      '💧',
      '🏃',
      '🧹',
      '🌈',
      '🎉',
      '🎁',
      '🎈',
      '🎀',
      '🪄',
      '🦄',
      '🐉',
      '🚀',
      '🛝',
      '🎠',
      '🎡',
      '🏰',
      '🧙',
      '🦸',
      '🦖',
      '🦕',
      '🐶',
      '🐱',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐸',
      '🐵',
      '🐯',
      '🦁',
      '🐨',
      '🐮',
      '🐷',
      '🐔',
      '🐢',
      '🐬',
      '🐳',
      '🦋',
      '🐝',
      '🐞',
      '🌻',
      '🌷',
      '🍎',
      '🍓',
      '🍉',
      '🍌',
      '🍕',
      '🍦',
      '🧁',
      '🍪',
      '🥞',
      '⚽',
      '🏀',
      '🎾',
      '🏆',
      '🚗',
      '🚂',
      '✈️',
      '🦓',
      '🐴',
      '🫏',
      '🦌',
      '🦬',
      '🐂',
      '🐃',
      '🐄',
      '🐎',
      '🐏',
      '🐑',
      '🐐',
      '🦙',
      '🦒',
      '🐘',
      '🦣',
      '🦏',
      '🦛',
      '🐪',
      '🐫',
      '🦘',
      '🦥',
      '🦦',
      '🦨',
      '🦡',
      '🐿️',
      '🦔',
      '🦇',
      '🐦',
      '🐧',
      '🕊️',
      '🦅',
      '🦆',
      '🦉',
      '🦩',
      '🦚',
      '🦜',
      '🪿',
      '🦢',
      '🦎',
      '🐊',
      '🪲',
      '🪳',
      '🦟',
      '🪰',
      '🪱',
      '🐌',
      '🕷️',
      '🦂',
      '🦀',
      '🦞',
      '🦐',
      '🦑',
      '🪼',
      '🪸',
      '🐠',
      '🐟',
      '🐡',
      '🦈',
      '🐋',
      '🦭',
      '🦪',
      '🦤',
      '🪶',
      '🍒',
      '🍍',
      '🥝',
      '🥑',
      '🥕',
      '🌽',
      '🍞',
      '🥐',
      '🥨',
      '🧀',
      '🍔',
      '🍟',
      '🌮',
      '🍿',
      '🍩',
      '🍫',
      '🍬',
      '🍭',
      '🍯',
      '🥛',
      '🧃',
      '🍱',
      '🍙',
      '🍜',
      '🍣',
      '🥗',
      '🥦',
      '🥒',
      '🫛',
      '🍆',
      '🫑',
      '🧄',
      '🧅',
      '🥔',
      '🍠',
      '🥜',
      '🌰',
      '🥥',
      '🥭',
      '🍈',
      '🍋',
      '🍊',
      '🍐',
      '🍇',
      '🫐',
      '🥬',
      '🥩',
      '🍗',
      '🥓',
      '🌭',
      '🥪',
      '🫓',
      '🥯',
      '🧇',
      '🥚',
      '🍳',
      '🫕',
      '🥘',
      '🍲',
      '🥟',
      '🍤',
      '🍥',
      '🥠',
      '🍡',
      '🍧',
      '🍨',
      '🍰',
      '🧉',
      '🫖',
      '🍵',
      '☕',
      '🥤',
      '🏸',
      '🏓',
      '🏐',
      '🏈',
      '⚾',
      '🥎',
      '🥏',
      '🏉',
      '🥊',
      '🥋',
      '⛸️',
      '🛹',
      '⛷️',
      '🏂',
      '🏄‍♀️',
      '🏊‍♂️',
      '🚴‍♀️',
      '🏇',
      '🧗‍♀️',
      '🤸‍♀️',
      '🤹‍♀️',
      '🧘‍♀️',
      '🛼',
      '⛹️‍♀️',
      '🥇',
      '🎯',
      '🎳',
      '🎮',
      '🕹️',
      '🎲',
      '🎭',
      '🎤',
      '🎧',
      '🎹',
      '🥁',
      '🎻',
      '🎺',
      '🎸',
      '🪇',
      '🪁',
      '🪃',
      '🪀',
      '🎐',
      '🎏',
      '🧵',
      '🧶',
      '🪡',
      '🪢',
      '✂️',
      '🖍️',
      '🖌️',
      '🖊️',
      '📏',
      '📐',
      '🧮',
      '🧪',
      '🔭',
      '🔬',
      '🧲',
      '🔧',
      '🔨',
      '🪛',
      '🪚',
      '🪜',
      '🧰',
      '🧯',
      '🪣',
      '🧽',
      '🧴',
      '🧻',
      '🪠',
      '🧺',
      '📦',
      '🪟',
      '🪑',
      '🛋️',
      '🛁',
      '🚿',
      '🪥',
      '🧼',
      '🪒',
      '🧹',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🚐',
      '🚑',
      '🚒',
      '🚓',
      '🚔',
      '🚲',
      '🛴',
      '🚜',
      '🚂',
      '🚃',
      '🚄',
      '🚅',
      '🚇',
      '🚉',
      '🚁',
      '🛩️',
      '🚀',
      '🛸',
      '⛵',
      '🚤',
      '🛶',
      '🛟',
      '⛽',
      '🗺️',
      '🧭',
      '🏕️',
      '⛺',
      '🏖️',
      '🏝️',
      '🗻',
      '🌋',
      '🏜️',
      '🏟️',
      '🏛️',
      '🏠',
      '🏡',
      '🛖',
      '🏫',
      '🏰',
      '🗼',
      '🗽',
      '⛲',
      '🌉',
      '🌌',
      '🌠',
      '🌙',
      '☀️',
      '🌤️',
      '🌧️',
      '⛈️',
      '❄️',
      '☃️',
      '🌊',
      '🍀',
      '🍁',
      '🍂',
      '🌵',
      '🌴',
      '🌲',
      '🌳',
      '🌼',
      '🌺',
      '🪻',
      '🪷',
      '💐',
      '🪹',
      '🪺',
      '🪸',
      '🎃',
      '👻',
      '🤖',
      '👾',
      '💩',
      '💎',
      '🪙',
      '💌',
      '💝',
      '💖',
      '💗',
      '💫',
      '🔔',
      '🎵',
      '🎶',
      '📱',
      '💻',
      '⌚',
      '📷',
      '🔋',
      '💡',
      '📌',
      '🔑',
      '🗝️',
      '🚪',
      '🛒',
      '🧸',
      '🪆',
      '🧩',
      '🪅',
      '🪩',
      '🛍️',
      '🧳',
      '🎟️',
      '🎪',
      '🎊',
      '🪄',
      '🧙‍♀️',
      '🧚‍♀️',
      '🧜‍♀️',
      '🧞‍♂️',
      '🧛‍♀️',
      '🧟‍♂️',
      '🦸‍♀️',
      '🦹‍♂️',
      '👑',
      '👒',
      '🧢',
      '🎩',
      '👟',
      '👞',
      '🩰',
      '🧤',
      '🧣',
      '🧥',
      '👗',
      '👕',
      '🩱',
      '👓',
      '🕶️',
      '🪭',
      '🪮',
    ]),
  );
  const [members, setMembers] = useState<Member[]>([]),
    [tasks, setTasks] = useState<Task[]>([]),
    [username, setUsername] = useState(''),
    [currentPassword, setCurrentPassword] = useState(''),
    [password, setPassword] = useState(''),
    [currentPin, setCurrentPin] = useState(''),
    [pin, setPin] = useState(''),
    [multiplier, setMultiplier] = useState('2'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(true),
    [authorized, setAuthorized] = useState(false);
  const [newMemberName, setNewMemberName] = useState(''),
    [newMemberAge, setNewMemberAge] = useState(''),
    [newMemberAvatar, setNewMemberAvatar] = useState(memberAvatars[0]);
  const [newMemberOpen, setNewMemberOpen] = useState(false),
    [newMemberError, setNewMemberError] = useState('');
  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNewMemberError('');
    setNotice('');
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMemberName, age: newMemberAge, avatar: newMemberAvatar }),
      });
      const result = await response.json();
      if (!response.ok) {
        setNewMemberError(result.error || 'No se pudo añadir el miembro.');
        return;
      }
      setMembers((rows) => [...rows, result]);
      setNewMemberOpen(false);
      setNewMemberName('');
      setNewMemberAge('');
      setNewMemberAvatar(memberAvatars[0]);
      setNotice(`Perfil de ${result.name} creado.`);
    } catch {
      setNewMemberError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };
  const load = async () => {
    setBusy(true);
    const auth = await fetch('/api/admin/session').then((r) => r.json());
    if (!auth.authorized) {
      setBusy(false);
      setAuthorized(false);
      return;
    }
    setAuthorized(true);
    const [m, t, s] = await Promise.all([
      fetch('/api/members').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/admin/settings').then((r) => r.json()),
    ]);
    setMembers(m);
    setTasks(t);
    setUsername(s.username || '');
    setMultiplier(s.investmentMultiplier || '2');
    setBusy(false);
  };
  useEffect(() => {
    void load();
  }, []);
  const saveMultiplier = async () => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ multiplier: Number(multiplier) }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setNotice('Multiplicador guardado.');
  };
  const saveCredentials = async () => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/admin/credentials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, currentPassword, newPassword: password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setCurrentPassword('');
    setPassword('');
    setNotice('Datos de acceso guardados. Usa la nueva contraseña en tu próximo inicio de sesión.');
  };
  const savePin = async () => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/admin/pin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin, newPin: pin }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setCurrentPin('');
    setPin('');
    setNotice('PIN actualizado.');
  };
  const saveMember = async (m: Member) => {
    setBusy(true);
    setError('');
    const [profileResponse, goalsResponse] = await Promise.all([
      fetch(`/api/members/${m.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: m.age }),
      }),
      fetch(`/api/members/${m.id}/investments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: m.investments }),
      }),
    ]);
    const profileData = await profileResponse.json(),
      goalsData = await goalsResponse.json();
    setBusy(false);
    if (!profileResponse.ok) {
      setError(profileData.error || 'No se pudo guardar la edad.');
      return;
    }
    if (!goalsResponse.ok) {
      setError(goalsData.error || 'No se pudieron guardar las metas.');
      return;
    }
    setNotice(`Perfil de ${m.name} guardado.`);
  };
  const uploadPortrait = async (member: Member, file?: File) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const image = new Image();
      image.src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 512 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height),
        src = new Uint8ClampedArray(pixels.data);
      for (let y = 1; y < canvas.height - 1; y++)
        for (let x = 1; x < canvas.width - 1; x++) {
          const i = (y * canvas.width + x) * 4,
            light = (j: number) => 0.299 * src[j] + 0.587 * src[j + 1] + 0.114 * src[j + 2],
            edge =
              Math.abs(light(i - 4) - light(i + 4)) +
              Math.abs(light(i - canvas.width * 4) - light(i + canvas.width * 4));
          if (edge > 74) {
            pixels.data[i] = 114;
            pixels.data[i + 1] = 28;
            pixels.data[i + 2] = 70;
          } else for (let c = 0; c < 3; c++) pixels.data[i + c] = Math.round(src[i + c] / 64) * 64;
        }
      context.putImageData(pixels, 0, 0);
      const avatar = canvas.toDataURL('image/jpeg', 0.78);
      const response = await fetch(`/api/members/${member.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el retrato.');
      setMembers((rows) => rows.map((m) => (m.id === member.id ? { ...m, avatar } : m)));
      setNotice(`Retrato ilustrado de ${member.name} guardado.`);
    } catch {
      setError('No se pudo convertir la foto. Prueba con otra imagen.');
    } finally {
      setBusy(false);
    }
  };
  const saveTasks = async () => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/admin/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    const saved = await fetch('/api/tasks').then((x) => x.json());
    setTasks(saved);
    setNotice('Tareas guardadas.');
  };
  const selectIconEmoji = (emoji: string) => {
    if (emojiTarget?.kind === 'task')
      setTasks((rows) =>
        rows.map((task, i) => (i === emojiTarget.taskIndex ? { ...task, icon: emoji } : task)),
      );
    if (emojiTarget?.kind === 'goal')
      setMembers((rows) =>
        rows.map((member, i) =>
          i === emojiTarget.memberIndex
            ? {
                ...member,
                investments: member.investments.map((goal, j) =>
                  j === emojiTarget.goalIndex ? { ...goal, icon: emoji } : goal,
                ),
              }
            : member,
        ),
      );
    setEmojiAnchor(null);
    setEmojiTarget(null);
  };
  const leave = () => {
    window.location.href = '/';
  };
  const navItems = [
    { id: 'profiles', label: 'Perfiles', icon: <PeopleAltRounded /> },
    { id: 'tasks', label: 'Tareas', icon: <ChecklistRounded /> },
    { id: 'investment', label: 'Inversión', icon: <TrendingUpRounded /> },
    { id: 'access', label: 'Acceso', icon: <LockRounded /> },
  ] as const;
  const sectionTitle = navItems.find((item) => item.id === section)?.label ?? 'Perfiles';
  const navContent = (
    <>
      <div className="admin-brand">
        <BrandLogo className="admin-brand-logo" size={43} />
        <div>
          <b>Banky</b>
          <small>ADMINISTRACIÓN</small>
        </div>
      </div>
      <List className="admin-nav-list">
        {navItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={section === item.id}
            onClick={() => {
              setSection(item.id);
              setMobileDrawerOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <div className="admin-nav-footer">🔒 Solo madres y padres</div>
    </>
  );
  if (busy && !authorized)
    return (
      <main className="admin-shell">
        <CircularProgress />
      </main>
    );
  if (!authorized)
    return (
      <main className="admin-shell">
        <Card className="admin-login-card">
          <Typography variant="h5">Zona de padres</Typography>
          <Typography color="text.secondary">
            Accede desde el botón de ajustes de la pantalla principal e introduce el número secreto.
          </Typography>
          <Button variant="contained" onClick={leave}>
            Volver al inicio
          </Button>
        </Card>
      </main>
    );
  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        {navContent}
        <div className="admin-sidebar-back">
          <Button startIcon={<ArrowBackRounded />} onClick={leave}>
            Volver a la app
          </Button>
        </div>
      </aside>
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        className="admin-mobile-drawer"
      >
        <div className="admin-drawer-content">
          {navContent}
          <div className="admin-sidebar-back">
            <Button startIcon={<ArrowBackRounded />} onClick={leave}>
              Volver a la app
            </Button>
          </div>
        </div>
      </Drawer>
      <div className="admin-main">
        <header className="admin-header">
          <IconButton
            className="admin-menu-button"
            aria-label="Abrir secciones"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <MenuRounded />
          </IconButton>
          <div>
            <Typography variant="overline">BANKY · ADMIN</Typography>
            <Typography variant="h4" component="h1">
              {sectionTitle}
            </Typography>
            <Typography className="admin-header-subtitle">
              {
                {
                  profiles: 'Sus planes. Su espacio.',
                  tasks: 'Pequeñas tareas. Grandes hábitos.',
                  investment: 'Su esfuerzo se multiplica.',
                  access: 'El acceso, en vuestras manos.',
                }[section]
              }
            </Typography>
          </div>
          <div className="admin-lock">🔒 Solo adultos</div>
        </header>
        <nav className="admin-mobile-tabs" aria-label="Secciones de padres">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setSection(item.id)}
              aria-current={section === item.id ? 'page' : undefined}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}
        <section className="admin-section-content">
          {section === 'profiles' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button
                aria-label="Añadir miembro"
                variant="contained"
                startIcon={<AddRounded />}
                disabled={busy}
                onClick={() => {
                  setNewMemberName('');
                  setNewMemberAge('');
                  setNewMemberAvatar(memberAvatars[0]);
                  setNewMemberError('');
                  setNewMemberOpen(true);
                }}
              >
                Añadir miembro
              </Button>
            </div>
          )}
          <Dialog
            open={newMemberOpen}
            onClose={() => {
              if (!busy) setNewMemberOpen(false);
            }}
            fullWidth
            maxWidth="sm"
            aria-labelledby="add-member-title"
            PaperProps={{ className: 'rounded-dialog' }}
          >
            <form onSubmit={addMember}>
              <DialogTitle id="add-member-title">Añadir miembro 👋</DialogTitle>
              <DialogContent sx={{ display: 'grid', gap: 2 }}>
                <Typography color="text.secondary">
                  Crea una cuenta para otro niño o niña.
                </Typography>
                {newMemberError && <Alert severity="error">{newMemberError}</Alert>}
                <TextField
                  label="Nombre"
                  value={newMemberName}
                  onChange={(event) => setNewMemberName(event.target.value)}
                  inputProps={{ maxLength: 40 }}
                  autoFocus
                  required
                  fullWidth
                  disabled={busy}
                />
                <TextField
                  label="Edad (opcional)"
                  type="number"
                  value={newMemberAge}
                  onChange={(event) => setNewMemberAge(event.target.value)}
                  inputProps={{ min: 1, max: 18, step: 1 }}
                  fullWidth
                  disabled={busy}
                />
                <TextField
                  select
                  label="Avatar"
                  value={newMemberAvatar}
                  onChange={(event) => setNewMemberAvatar(event.target.value)}
                  fullWidth
                  disabled={busy}
                >
                  {memberAvatars.map((avatar) => (
                    <MenuItem key={avatar} value={avatar}>
                      {avatar}
                    </MenuItem>
                  ))}
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setNewMemberOpen(false)} disabled={busy}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <AddRounded />}
                  disabled={busy || !newMemberName.trim()}
                >
                  Añadir miembro
                </Button>
              </DialogActions>
            </form>
          </Dialog>
          {section === 'profiles' && (
            <div className="admin-members">
              {members.map((m, index) => (
                <article className="admin-member" key={m.id}>
                  <div className="admin-member-head">
                    <Avatar
                      src={m.avatar.startsWith('data:image/') ? m.avatar : undefined}
                      className="admin-avatar"
                    >
                      {m.avatar.startsWith('data:image/') ? '' : m.avatar}
                    </Avatar>
                    <div>
                      <b>{m.name}</b>
                      <small>Perfil familiar</small>
                    </div>
                    <Button size="small" component="label" startIcon={<PhotoCameraRounded />}>
                      Foto
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) => void uploadPortrait(m, e.target.files?.[0])}
                      />
                    </Button>
                  </div>
                  <div className="admin-age-row">
                    <TextField
                      label="Edad"
                      type="number"
                      value={m.age ?? ''}
                      inputProps={{ min: 1, max: 18 }}
                      onChange={(e) =>
                        setMembers((rows) =>
                          rows.map((x, i) =>
                            i === index
                              ? { ...x, age: e.target.value ? Number(e.target.value) : null }
                              : x,
                          ),
                        )
                      }
                    />
                  </div>
                  <Typography className="admin-subtitle">Metas de inversión</Typography>
                  <div className="admin-goals">
                    {m.investments.map((goal, j) => (
                      <div className="admin-goal-row" key={goal.id ?? j}>
                        <div className="admin-goal-icon-control">
                          <Typography variant="caption">Icono</Typography>
                          <Button
                            aria-label={`Elegir icono para ${goal.name}`}
                            onClick={(e) => {
                              setEmojiTarget({ kind: 'goal', memberIndex: index, goalIndex: j });
                              setEmojiAnchor(e.currentTarget);
                            }}
                          >
                            {goal.icon}
                          </Button>
                        </div>
                        <TextField
                          size="small"
                          label="Nombre de la meta"
                          value={goal.name}
                          onChange={(e) =>
                            setMembers((rows) =>
                              rows.map((x, i) =>
                                i === index
                                  ? {
                                      ...x,
                                      investments: x.investments.map((g, k) =>
                                        k === j ? { ...g, name: e.target.value } : g,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <IconButton
                          aria-label="Eliminar meta"
                          disabled={!!goal.balanceCents}
                          onClick={() =>
                            setMembers((rows) =>
                              rows.map((x, i) =>
                                i === index
                                  ? { ...x, investments: x.investments.filter((_, k) => k !== j) }
                                  : x,
                              ),
                            )
                          }
                        >
                          ×
                        </IconButton>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="small"
                    startIcon={<AddRounded />}
                    disabled={m.investments.length >= 5}
                    onClick={() =>
                      setMembers((rows) =>
                        rows.map((x, i) =>
                          i === index
                            ? {
                                ...x,
                                investments: [...x.investments, { name: 'Nueva meta', icon: '🌟' }],
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    Añadir meta
                  </Button>
                  <Button
                    className="admin-save-member"
                    variant="contained"
                    onClick={() => void saveMember(m)}
                  >
                    Guardar perfil
                  </Button>
                </article>
              ))}
            </div>
          )}
          {section === 'investment' && (
            <Card className="admin-panel admin-narrow-panel">
              <div className="admin-panel-heading">
                <span>📈</span>
                <div>
                  <Typography variant="h6">Reglas de inversión</Typography>
                  <Typography color="text.secondary">Cuánto crece cada aportación</Typography>
                </div>
              </div>
              <div className="admin-rule-hero">
                <span>Multiplicador de las aportaciones</span>
                <strong>×{multiplier || '2'}</strong>
                <p>Por cada 1 € aportado, hay {multiplier || '2'} € para la meta.</p>
              </div>
              <TextField
                label="Multiplicador"
                type="number"
                value={multiplier}
                inputProps={{ min: 1, max: 10, step: 1 }}
                onChange={(e) => setMultiplier(e.target.value)}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Ejemplo: ×{multiplier || '2'} convierte 1 € aportado en {multiplier || '2'} € para
                la meta.
              </Typography>
              <Button
                variant="contained"
                startIcon={<SaveRounded />}
                onClick={() => void saveMultiplier()}
              >
                Guardar regla
              </Button>
            </Card>
          )}
          {section === 'access' && (
            <div className="admin-access-grid">
              <Card className="admin-panel admin-narrow-panel">
                <div className="admin-panel-heading">
                  <span>👤</span>
                  <div>
                    <Typography variant="h6">Usuario y contraseña</Typography>
                    <Typography color="text.secondary">
                      Confirma la contraseña actual para guardar
                    </Typography>
                  </div>
                </div>
                <TextField
                  label="Usuario principal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Contraseña actual"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Nueva contraseña (opcional)"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={() => void saveCredentials()}
                >
                  Guardar usuario y contraseña
                </Button>
              </Card>
              <Card className="admin-panel admin-narrow-panel">
                <div className="admin-panel-heading">
                  <span>🔐</span>
                  <div>
                    <Typography variant="h6">PIN de padres</Typography>
                    <Typography color="text.secondary">
                      Confirma el PIN actual para cambiarlo
                    </Typography>
                  </div>
                </div>
                <TextField
                  label="PIN actual"
                  type="password"
                  inputProps={{
                    inputMode: 'numeric',
                    maxLength: 4,
                    autoComplete: 'current-password',
                  }}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  fullWidth
                />
                <TextField
                  label="Nuevo PIN (4 cifras)"
                  type="password"
                  inputProps={{ inputMode: 'numeric', maxLength: 4, autoComplete: 'new-password' }}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SaveRounded />}
                  onClick={() => void savePin()}
                >
                  Cambiar PIN
                </Button>
              </Card>
            </div>
          )}
          {section === 'tasks' && (
            <Card className="admin-panel admin-tasks">
              <div className="admin-panel-heading">
                <span>🧹</span>
                <div>
                  <Typography variant="h6">Tareas y recompensas</Typography>
                  <Typography color="text.secondary">
                    Lo que aparece a los niños para elegir
                  </Typography>
                </div>
                <Button
                  startIcon={<AddRounded />}
                  onClick={() =>
                    setTasks((rows) => [
                      ...rows,
                      {
                        title: 'Nueva tarea',
                        description: 'Cuéntales qué hacer',
                        amountCents: 100,
                        icon: '✨',
                      },
                    ])
                  }
                >
                  Añadir
                </Button>
              </div>
              <div className="admin-task-list">
                {tasks.map((t, i) => (
                  <div className="admin-task-row" key={t.id ?? `new${i}`}>
                    <Button
                      className="admin-task-icon-button"
                      aria-label={`Elegir icono para ${t.title}`}
                      onClick={(e) => {
                        setEmojiTarget({ kind: 'task', taskIndex: i });
                        setEmojiAnchor(e.currentTarget);
                      }}
                    >
                      {t.icon}
                    </Button>
                    <TextField
                      size="small"
                      label="Nombre"
                      value={t.title}
                      onChange={(e) =>
                        setTasks((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                        )
                      }
                    />
                    <TextField
                      size="small"
                      label="Descripción"
                      value={t.description}
                      onChange={(e) =>
                        setTasks((rows) =>
                          rows.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)),
                        )
                      }
                    />
                    <TextField
                      size="small"
                      label="€"
                      type="number"
                      value={(t.amountCents / 100).toFixed(2)}
                      onChange={(e) =>
                        setTasks((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? { ...x, amountCents: Math.round(Number(e.target.value) * 100) }
                              : x,
                          ),
                        )
                      }
                    />
                    <IconButton
                      aria-label="Eliminar tarea"
                      onClick={() => setTasks((rows) => rows.filter((_, j) => j !== i))}
                    >
                      ×
                    </IconButton>
                  </div>
                ))}
              </div>
              <Button
                variant="contained"
                startIcon={<SaveRounded />}
                onClick={() => void saveTasks()}
              >
                Guardar tareas
              </Button>
            </Card>
          )}
        </section>
        <Popover
          open={!!emojiAnchor}
          anchorEl={emojiAnchor}
          onClose={() => {
            setEmojiAnchor(null);
            setEmojiTarget(null);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <div className="task-emoji-picker">
            {taskEmojis.map((emoji, index) => (
              <button
                type="button"
                key={`${emoji}-${index}`}
                aria-label={`Seleccionar ${emoji}`}
                onClick={() => selectIconEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Popover>
        {busy && (
          <div className="admin-saving">
            <CircularProgress size={22} />
          </div>
        )}
      </div>
    </main>
  );
}
