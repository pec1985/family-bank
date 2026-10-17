'use client';
import BrandLogo from './components/BrandLogo';
import FamilyMascot from './components/FamilyMascot';
import PinDialog from './components/PinDialog';
import { memberSlug as slug } from '@/lib/member-names';
import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AccountBalanceWalletRounded from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import CelebrationRounded from '@mui/icons-material/CelebrationRounded';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';

type Investment = { id: number; name: string; icon: string; balanceCents: number };
type Member = {
  id: number;
  name: string;
  avatar: string;
  age: number | null;
  cashCents: number;
  investmentCents: number;
  investments: Investment[];
};
type Task = { id: number; title: string; description: string; amountCents: number; icon: string };
type Transaction = {
  id: number;
  kind: string;
  amountCents: number;
  note: string;
  createdAt: string;
  taskTitle?: string;
};
const money = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
export default function Home() {
  const [logged, setLogged] = useState(false),
    [members, setMembers] = useState<Member[]>([]),
    [tasks, setTasks] = useState<Task[]>([]),
    [transactions, setTransactions] = useState<Transaction[]>([]);
  const [member, setMember] = useState<Member | null>(null),
    [taskMember, setTaskMember] = useState<Member | null>(null),
    [tab, setTab] = useState(0),
    [addOpen, setAddOpen] = useState(false),
    [codeOpen, setCodeOpen] = useState(false),
    [selected, setSelected] = useState<Task | null>(null),
    [investOpen, setInvestOpen] = useState(false),
    [customOpen, setCustomOpen] = useState(false);
  const [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [code, setCode] = useState(''),
    [amount, setAmount] = useState(''),
    [customTitle, setCustomTitle] = useState(''),
    [customAmount, setCustomAmount] = useState(''),
    [customEmoji, setCustomEmoji] = useState('✨'),
    [customSave, setCustomSave] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const [adminPinOpen, setAdminPinOpen] = useState(false),
    [adminPin, setAdminPin] = useState('');
  const [investmentMultiplier, setInvestmentMultiplier] = useState(2);
  const [photoOpen, setPhotoOpen] = useState(false),
    [photoMember, setPhotoMember] = useState<Member | null>(null),
    [parentGateOpen, setParentGateOpen] = useState(false),
    [profileEditOpen, setProfileEditOpen] = useState(false),
    [parentPassword, setParentPassword] = useState(''),
    [ageDraft, setAgeDraft] = useState(''),
    [goalDrafts, setGoalDrafts] = useState<
      { id?: number; name: string; icon: string; balanceCents?: number }[]
    >([]),
    [newGoalName, setNewGoalName] = useState(''),
    [investmentId, setInvestmentId] = useState('');
  const refresh = async () => {
    const [m, t, s] = await Promise.all([
      fetch('/api/members').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]);
    setMembers(m);
    setTasks(t);
    setInvestmentMultiplier(s.investmentMultiplier || 2);
    const accountSlug = window.location.pathname.match(/^\/accounts\/([^/]+)\/?$/)?.[1];
    if (accountSlug) {
      const current = m.find((x: Member) => slug(x.name) === accountSlug);
      if (current) {
        setMember(current);
        const rows = await fetch(`/api/members/${current.id}/transactions`).then((r) => r.json());
        setTransactions(rows);
      }
    }
  };
  useEffect(() => {
    void fetch('/api/login')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setLogged(true);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (logged) void refresh();
  }, [logged]);
  useEffect(() => {
    const syncRoute = () => {
      const accountSlug = window.location.pathname.match(/^\/accounts\/([^/]+)\/?$/)?.[1];
      const current = members.find((m) => slug(m.name) === accountSlug);
      setMember(current || null);
      setError('');
      if (current)
        void fetch(`/api/members/${current.id}/transactions`)
          .then((r) => r.json())
          .then(setTransactions);
    };
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [members]);
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setLogged(true);
  };
  const openMember = async (m: Member) => {
    window.history.pushState({}, '', `/accounts/${slug(m.name)}`);
    setMember(m);
    setTab(0);
    const r = await fetch(`/api/members/${m.id}/transactions`);
    setTransactions(await r.json());
  };
  const closeMember = () => {
    window.history.pushState({}, '', '/');
    setMember(null);
    setError('');
    void refresh();
  };
  const claim = async (pin: string) => {
    if (!member || !selected) return;
    setBusy(true);
    setError('');
    const isCustom = selected.id < 0;
    const r = await fetch(
      `/api/members/${member.id}/tasks/${isCustom ? 'custom' : selected.id}/claim`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: pin,
          ...(isCustom
            ? {
                title: selected.title,
                amountCents: selected.amountCents,
                emoji: selected.icon,
                save: customSave,
              }
            : {}),
        }),
      },
    );
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setCodeOpen(false);
    setAddOpen(false);
    setTaskMember(null);
    setCode('');
    setSelected(null);
    if (!window.location.pathname.startsWith('/accounts/')) setMember(null);
    await refresh();
  };
  const prepareCustom = () => {
    const cents = Math.round(Number(customAmount) * 100);
    if (!customTitle.trim() || !Number.isInteger(cents) || cents < 1) {
      setError('Escribe el nombre y un valor válido para la tarea.');
      return;
    }
    setSelected({
      id: -1,
      title: customTitle.trim(),
      description: 'Tarea personalizada',
      amountCents: cents,
      icon: customEmoji,
    });
    setError('');
    setCustomOpen(false);
    setCode('');
    setCodeOpen(true);
  };
  const invest = async () => {
    if (!member) return;
    setBusy(true);
    setError('');
    const r = await fetch(`/api/members/${member.id}/invest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, investmentId: Number(investmentId) }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setInvestOpen(false);
    setAmount('');
    await refresh();
  };
  const submitPin = async (action: () => Promise<void>) => {
    if (busy) return;
    try {
      await action();
    } catch {
      setError('No se pudo comprobar el PIN. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };
  const openParentGate = () => {
    setError('');
    setParentPassword('');
    setParentGateOpen(true);
  };
  const enterAdmin = async (pin: string) => {
    setBusy(true);
    setError('');
    const r = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(d.error);
      return;
    }
    setAdminPinOpen(false);
    window.location.href = '/admin';
  };
  const closeProfileEditor = () => {
    setProfileEditOpen(false);
    void fetch('/api/parent/lock', { method: 'POST' });
  };
  const verifyParent = async (pin: string) => {
    if (!member) return;
    setBusy(true);
    setError('');
    const response = await fetch('/api/parent/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error);
      return;
    }
    setParentGateOpen(false);
    setAgeDraft(member.age ? String(member.age) : '');
    setGoalDrafts(
      member.investments.map((goal) => ({
        id: goal.id,
        name: goal.name,
        icon: goal.icon,
        balanceCents: goal.balanceCents,
      })),
    );
    setNewGoalName('');
    setPhotoMember(member);
    setProfileEditOpen(true);
  };
  const saveProfile = async () => {
    if (!member) return;
    setBusy(true);
    setError('');
    const profileResponse = await fetch(`/api/members/${member.id}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: ageDraft }),
    });
    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      setBusy(false);
      setError(profileData.error);
      return;
    }
    const goalsResponse = await fetch(`/api/members/${member.id}/investments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals: goalDrafts }),
    });
    const goalsData = await goalsResponse.json();
    setBusy(false);
    if (!goalsResponse.ok) {
      setError(goalsData.error);
      return;
    }
    closeProfileEditor();
    await refresh();
  };
  const choosePhoto = async (file?: File) => {
    if (!file || !photoMember) return;
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
          } else {
            for (let c = 0; c < 3; c++) pixels.data[i + c] = Math.round(src[i + c] / 64) * 64;
          }
        }
      context.putImageData(pixels, 0, 0);
      const avatar = canvas.toDataURL('image/jpeg', 0.78);
      const response = await fetch(`/api/members/${photoMember.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar la foto.');
      setPhotoOpen(false);
      setPhotoMember(null);
      await refresh();
    } catch {
      setError('No se pudo convertir la foto. Prueba con otra imagen.');
    } finally {
      setBusy(false);
    }
  };
  const totalBalance = member ? member.cashCents + member.investmentCents : 0;
  const cashPercent = totalBalance ? (member!.cashCents / totalBalance) * 100 : 0;
  const investmentPercent = totalBalance ? (member!.investmentCents / totalBalance) * 100 : 0;
  const contributionCents = Math.max(0, Math.round((Number(amount) || 0) * 100));
  const projectedCents = Math.round(contributionCents * investmentMultiplier);
  const validContribution =
    Number.isFinite(Number(amount)) &&
    contributionCents > 0 &&
    contributionCents <= (member?.cashCents || 0);
  const percentLabel = (value: number) =>
    `${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
  if (!logged)
    return (
      <main className="login-page">
        <div className="login-glow" />
        <Card className="login-card">
          <div className="login-brand">
            <BrandLogo className="brand-icon" size={40} />
            <b>Family Bank</b>
          </div>
          <div className="login-mascot">
            <FamilyMascot />
          </div>
          <Typography variant="h4" component="h1" fontWeight={900}>
            Pequeños pasos,
            <br />
            grandes sueños.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Un lugar para crecer en familia.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={login} className="login-form">
            <TextField
              label="Usuario"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
            </Button>
          </form>
        </Card>
      </main>
    );
  return (
    <main className="app-shell">
      <header className="topbar">
        {member ? (
          <IconButton onClick={closeMember} aria-label="Volver">
            <ArrowBackRounded />
          </IconButton>
        ) : (
          <BrandLogo className="mini-brand" size={40} />
        )}
        <div className="top-title">
          <Typography variant="h6" fontWeight={800}>
            {member ? member.name : 'Family Bank'}
          </Typography>
        </div>
        {!member ? (
          <IconButton
            aria-label="Ajustes de padres"
            className="settings-button"
            onClick={() => {
              setAdminPin('');
              setError('');
              setAdminPinOpen(true);
            }}
          >
            <SettingsRounded />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Editar perfil"
            className="topbar-profile-button"
            onClick={openParentGate}
          >
            <MemberAvatar member={member} className="topbar-member-avatar" />
          </IconButton>
        )}
      </header>
      {!member ? (
        <>
          <section className="welcome">
            <div className="welcome-copy">
              <Typography className="eyebrow">TU BANCO FAMILIAR</Typography>
              <Typography variant="h5" component="h1" fontWeight={900}>
                ¡Hola, familia!
                <br />A por esos sueños.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                El esfuerzo tiene su recompensa.
              </Typography>
            </div>
            <FamilyMascot multiplier={investmentMultiplier} />
          </section>
          <div className="section-heading">
            <Typography component="h2" className="section-label">
              Cuentas de la familia
            </Typography>
            <span>
              {members.length} {members.length === 1 ? 'perfil' : 'perfiles'}
            </span>
          </div>
          <div className="member-list">
            {members.length === 0 && (
              <div className="family-empty">
                <span aria-hidden="true">✦</span>
                <h2>El primer paso es hacerlo juntos.</h2>
                <p>Añade un perfil para empezar a ganar, guardar y hacer planes.</p>
                <Button
                  variant="contained"
                  onClick={() => {
                    setAdminPin('');
                    setError('');
                    setAdminPinOpen(true);
                  }}
                >
                  Añadir el primer miembro
                </Button>
              </div>
            )}
            {members.map((m) => (
              <Card key={m.id} className="member-card">
                <CardActionArea onClick={() => void openMember(m)}>
                  <div className="member-row">
                    <span className="avatar-wrap">
                      <MemberAvatar member={m} className="member-avatar" />
                    </span>
                    <div className="member-info">
                      <Typography fontWeight={750}>{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ahorro total
                      </Typography>
                    </div>
                    <div className="member-total">
                      <Typography fontWeight={800}>
                        {money(m.cashCents + m.investmentCents)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        total
                      </Typography>
                    </div>
                  </div>
                  <div className="member-balances">
                    <div>
                      <AccountBalanceWalletRounded />
                      <span>
                        Efectivo <b>{money(m.cashCents)}</b>
                      </span>
                    </div>
                    <div>
                      <TrendingUpRounded />
                      <span>
                        Inversión <b>{money(m.investmentCents)}</b>
                      </span>
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            ))}
          </div>
          <div className="tip-card">
            <span>💡</span>
            <div>
              <b>¡Cada tarea cuenta!</b>
              <Typography variant="caption" display="block" color="text.secondary">
                Completa tareas para ganar dinero.
              </Typography>
            </div>
          </div>
          <Button
            variant="contained"
            className="add-task-button"
            fullWidth
            startIcon={<AddIcon />}
            disabled={members.length === 0}
            onClick={() => {
              setError('');
              setAddOpen(true);
            }}
          >
            Añadir tarea
          </Button>
          <Dialog
            open={addOpen}
            onClose={() => setAddOpen(false)}
            fullWidth
            PaperProps={{ className: 'rounded-dialog' }}
          >
            <DialogTitle>¿A quién le damos una tarea?</DialogTitle>
            <DialogContent>
              <div className="chooser-list">
                {members.map((m) => (
                  <Button
                    key={m.id}
                    className="chooser-item"
                    onClick={() => {
                      void openMember(m);
                      setAddOpen(false);
                      setSelected(null);
                      setError('');
                      setTimeout(() => setAddOpen(false), 0);
                      setTaskMember(m);
                    }}
                  >
                    <MemberAvatar member={m} className="chooser-avatar" />
                    <span>{m.name}</span>
                    <span className="chooser-arrow">›</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Typography component="h1" className="account-heading">
            {tab === 0 ? (
              <>
                Tu esfuerzo
                <br />
                ya tiene un lugar.
              </>
            ) : (
              <>
                Lo que sueñas,
                <br />
                un poco más cerca.
              </>
            )}
          </Typography>
          <section className="detail-summary">
            <div
              className="balance-chart-card"
              role="img"
              aria-label={`Saldo total ${money(totalBalance)}. Efectivo ${percentLabel(cashPercent)}, ${money(member.cashCents)}. Ahorro e inversión ${percentLabel(investmentPercent)}, ${money(member.investmentCents)}.`}
            >
              <Typography className="eyebrow">Saldo total de {member.name}</Typography>
              <Typography className="balance-chart-total">{money(totalBalance)}</Typography>
              <div className="balance-chart-bar" aria-hidden="true">
                <span className="balance-chart-cash" style={{ width: `${cashPercent}%` }} />
                <span
                  className="balance-chart-investment"
                  style={{ width: `${investmentPercent}%` }}
                />
              </div>
              <div className="balance-chart-legend">
                <div className="balance-chart-item">
                  <div className="balance-chart-label">
                    <span className="balance-dot cash-dot" />
                    Efectivo
                  </div>
                  <b>{money(member.cashCents)}</b>
                </div>
                <div className="balance-chart-item investment-item">
                  <div className="balance-chart-label">
                    Ahorro e inversión
                    <span className="balance-dot investment-dot" />
                  </div>
                  <b>{money(member.investmentCents)}</b>
                </div>
              </div>
            </div>
          </section>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            className="balance-tabs"
            aria-label="Tipo de saldo"
          >
            <Tab label="Efectivo" />
            <Tab label="Inversión" />
          </Tabs>
          {tab === 0 ? (
            <div className="account-content">
              <Card className="account-card cash-compact-card">
                <div className="cash-compact-icon">
                  <AccountBalanceWalletRounded />
                </div>
                <div className="cash-compact-copy">
                  <Typography variant="caption" color="text.secondary">
                    Saldo en efectivo
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {money(member.cashCents)}
                  </Typography>
                </div>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    const firstGoal = member.investments[0];
                    if (firstGoal) {
                      setInvestmentId(String(firstGoal.id));
                      setAmount('');
                      setInvestOpen(true);
                    } else setTab(1);
                  }}
                >
                  Invertir para una meta
                </Button>
              </Card>
              <div className="history-head">
                <Typography fontWeight={800}>Actividad reciente</Typography>
                <Typography variant="caption" color="text.secondary">
                  {transactions.filter((t) => t.kind === 'task').length} tareas
                </Typography>
              </div>
              <div className="transaction-list">
                {transactions
                  .filter((t) => t.kind === 'task')
                  .map((t) => (
                    <div className="transaction-row" key={t.id}>
                      <div className="transaction-icon">✨</div>
                      <div className="transaction-label">
                        <b>{t.taskTitle || t.note}</b>
                        <small>
                          {new Date(t.createdAt + 'Z').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </small>
                      </div>
                      <b className="positive">+{money(t.amountCents)}</b>
                    </div>
                  ))}
                {transactions.filter((t) => t.kind === 'task').length === 0 && (
                  <div className="empty-state">
                    <span>🌟</span>
                    <b>Aquí empiezan tus logros.</b>
                    <Typography color="text.secondary">
                      Las tareas completadas aparecerán aquí.
                    </Typography>
                  </div>
                )}
              </div>
              <Button
                fullWidth
                className="secondary-action"
                onClick={() => {
                  setSelected(null);
                  setError('');
                  setTaskMember(member);
                }}
                startIcon={<AddIcon />}
              >
                Elegir una tarea
              </Button>
            </div>
          ) : (
            <div className="account-content">
              <div className="dream-heading">
                <div>
                  <Typography variant="h5" component="h2">
                    Metas de inversión
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Elige en cuál quieres ahorrar.
                  </Typography>
                </div>
              </div>
              <div className="dream-list">
                {member.investments.map((goal) => (
                  <Card key={goal.id} className="dream-card">
                    <span className="goal-badge">Tu dinero crece ×{investmentMultiplier}</span>
                    <div className="dream-card-icon">{goal.icon}</div>
                    <div className="dream-card-copy">
                      <b>{goal.name}</b>
                      <span className="goal-amount">{money(goal.balanceCents)}</span>
                    </div>
                    <Button
                      size="small"
                      onClick={() => {
                        setInvestmentId(String(goal.id));
                        setAmount('');
                        setInvestOpen(true);
                      }}
                    >
                      Invertir en esta meta
                    </Button>
                  </Card>
                ))}
              </div>
              <Card className="account-card investment-card">
                <div className="growth-note">
                  <CelebrationRounded /> Tu dinero crece ×{investmentMultiplier}
                </div>
              </Card>
              <div className="history-head">
                <Typography fontWeight={800}>Movimientos de inversión</Typography>
              </div>
              <div className="transaction-list">
                {transactions
                  .filter((t) => t.kind === 'invest')
                  .map((t) => (
                    <div className="transaction-row" key={t.id}>
                      <div className="transaction-icon invest-icon-small">📈</div>
                      <div className="transaction-label">
                        <b>{t.note.replace('Inversión: ', '')}</b>
                        <small>
                          {new Date(t.createdAt + 'Z').toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </small>
                      </div>
                      <b className="positive">+{money(t.amountCents)}</b>
                    </div>
                  ))}
                {transactions.filter((t) => t.kind === 'invest').length === 0 && (
                  <div className="empty-state">
                    <span>🌱</span>
                    <Typography color="text.secondary">
                      Invierte efectivo para empezar a crecer.
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {error && member && !codeOpen && !adminPinOpen && !parentGateOpen && (
        <Alert severity="error" className="floating-error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Dialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        fullWidth
        PaperProps={{ className: 'rounded-dialog' }}
      >
        <DialogTitle>Añade otra tarea ✨</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nombre de la tarea"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            inputProps={{ maxLength: 60 }}
            fullWidth
            sx={{ mt: 1, mb: 2 }}
          />
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            Elige un emoji
          </Typography>
          <div className="emoji-picker">
            {['✨', '🧹', '🧺', '🍽️', '🛏️', '📚', '🐾', '🌿', '🎨', '🧸', '🚲', '⭐'].map(
              (emoji) => (
                <button
                  type="button"
                  aria-label={`Elegir ${emoji}`}
                  aria-pressed={customEmoji === emoji}
                  className={customEmoji === emoji ? 'emoji-option selected' : 'emoji-option'}
                  key={emoji}
                  onClick={() => setCustomEmoji(emoji)}
                >
                  {emoji}
                </button>
              ),
            )}
          </div>
          <TextField
            label="Valor (€)"
            type="number"
            inputProps={{ min: 0.01, step: 0.01 }}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox checked={customSave} onChange={(e) => setCustomSave(e.target.checked)} />
            }
            label="Guardar para volver a usarla"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={prepareCustom}>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
      <PinDialog
        open={codeOpen}
        title="Confirma la tarea 🔐"
        value={code}
        onChange={setCode}
        onComplete={(pin) => void submitPin(() => claim(pin))}
        onClose={() => setCodeOpen(false)}
        busy={busy}
        error={error}
      >
        Introduce el código para añadir {selected ? money(selected.amountCents) : ''} a la cuenta de{' '}
        {member?.name}.
      </PinDialog>
      <Dialog
        open={investOpen}
        onClose={() => setInvestOpen(false)}
        fullWidth
        PaperProps={{ className: 'rounded-dialog' }}
      >
        <DialogTitle>Invertir para una meta</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Elige una meta y la cantidad. Tu aportación crecerá ×{investmentMultiplier}. Tienes{' '}
            {money(member?.cashCents || 0)} en efectivo.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="investment-goal-label">Meta de inversión</InputLabel>
            <Select
              labelId="investment-goal-label"
              label="Meta de inversión"
              value={investmentId}
              onChange={(e) => setInvestmentId(String(e.target.value))}
            >
              {member?.investments.map((goal) => (
                <MenuItem key={goal.id} value={String(goal.id)}>
                  {goal.icon} {goal.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            label="Cantidad a invertir (€)"
            type="number"
            inputProps={{ min: 0.01, max: (member?.cashCents || 0) / 100, step: 0.01 }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />
          <div className="investment-preview" aria-live="polite">
            <div>
              <span>Tu aportación</span>
              <b>{money(contributionCents)}</b>
            </div>
            <div>
              <span>La familia añade</span>
              <b>{money(projectedCents - contributionCents)}</b>
            </div>
            <div className="investment-preview-total">
              <b>Para tu meta</b>
              <strong>{money(projectedCents)}</strong>
            </div>
          </div>
          {member?.cashCents === 0 && (
            <Typography className="investment-hint">
              Completa una tarea para tener efectivo disponible.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvestOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => void invest()}
            disabled={busy || !investmentId || !validContribution}
          >
            {busy ? 'Invirtiendo…' : 'Invertir'}
          </Button>
        </DialogActions>
      </Dialog>
      <TaskDialog
        member={taskMember}
        tasks={tasks}
        onClose={() => setTaskMember(null)}
        onSelect={(t) => {
          setSelected(t);
          setError('');
          setCode('');
          setCodeOpen(true);
        }}
        onOther={() => {
          setTaskMember(null);
          setCustomTitle('');
          setCustomAmount('');
          setCustomEmoji('✨');
          setCustomSave(true);
          setError('');
          setCustomOpen(true);
        }}
      />
      <PinDialog
        open={adminPinOpen}
        title="Ajustes de padres 🔒"
        value={adminPin}
        onChange={setAdminPin}
        onComplete={(pin) => void submitPin(() => enterAdmin(pin))}
        onClose={() => setAdminPinOpen(false)}
        busy={busy}
        error={error}
      >
        Introduce el número secreto para entrar en Admin.
      </PinDialog>
      <PinDialog
        open={parentGateOpen}
        title="Zona de madres y padres 🔒"
        value={parentPassword}
        onChange={setParentPassword}
        onComplete={(pin) => void submitPin(() => verifyParent(pin))}
        onClose={() => setParentGateOpen(false)}
        busy={busy}
        error={error}
      >
        Introduce el número secreto para editar el perfil de {member?.name}.
      </PinDialog>
      <Dialog
        open={profileEditOpen}
        onClose={closeProfileEditor}
        fullWidth
        PaperProps={{ className: 'rounded-dialog' }}
      >
        <DialogTitle>Editar perfil de {member?.name} ✨</DialogTitle>
        <DialogContent>
          <div className="profile-photo-edit">
            {member && <MemberAvatar member={member} className="edit-avatar" />}
            <Button
              size="small"
              startIcon={<PhotoCameraRounded />}
              onClick={() => setPhotoOpen(true)}
            >
              Cambiar foto
            </Button>
          </div>
          <TextField
            label="Edad"
            type="number"
            inputProps={{ min: 1, max: 18, step: 1 }}
            value={ageDraft}
            onChange={(e) => setAgeDraft(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" className="profile-section-title">
            Metas de inversión
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Estas son las opciones que verá en la pestaña Inversión.
          </Typography>
          <div className="profile-goal-list">
            {goalDrafts.map((goal, index) => (
              <div className="profile-goal-row" key={goal.id ?? `new-${index}`}>
                <span>{goal.icon}</span>
                <TextField
                  size="small"
                  label={`Meta ${index + 1}`}
                  value={goal.name}
                  onChange={(e) =>
                    setGoalDrafts((rows) =>
                      rows.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)),
                    )
                  }
                  fullWidth
                />
                <IconButton
                  aria-label={`Quitar ${goal.name}`}
                  disabled={!!goal.balanceCents}
                  onClick={() => setGoalDrafts((rows) => rows.filter((_, i) => i !== index))}
                >
                  ×
                </IconButton>
              </div>
            ))}
          </div>
          {goalDrafts.some((goal) => (goal.balanceCents || 0) > 0) && (
            <Typography variant="caption" color="text.secondary">
              Las metas con dinero ahorrado no se pueden eliminar.
            </Typography>
          )}
          <div className="profile-add-goal">
            <TextField
              size="small"
              label="Nueva meta"
              placeholder="Por ejemplo, una bicicleta"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              inputProps={{ maxLength: 60 }}
              fullWidth
            />
            <Button
              onClick={() => {
                if (newGoalName.trim() && goalDrafts.length < 5) {
                  setGoalDrafts((rows) => [...rows, { name: newGoalName.trim(), icon: '🌟' }]);
                  setNewGoalName('');
                }
              }}
              disabled={!newGoalName.trim() || goalDrafts.length >= 5}
            >
              Añadir
            </Button>
          </div>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProfileEditor}>Cancelar</Button>
          <Button variant="contained" onClick={() => void saveProfile()} disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar perfil'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        fullWidth
        PaperProps={{ className: 'rounded-dialog' }}
      >
        <DialogTitle>Una foto con estilo de dibujo ✨</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Elige una foto y la convertiremos en un retrato ilustrado para su perfil.
          </Typography>
          <Button
            component="label"
            variant="contained"
            startIcon={<PhotoCameraRounded />}
            disabled={busy}
          >
            Elegir foto
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => void choosePhoto(e.target.files?.[0])}
            />
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
function MemberAvatar({ member, className }: { member: Member; className: string }) {
  const slot = member.avatar.startsWith('example:') ? Number(member.avatar.split(':')[1]) : 0;
  return (
    <Avatar
      src={member.avatar.startsWith('data:image/') ? member.avatar : undefined}
      className={className}
    >
      {member.avatar.startsWith('example:') ? (
        <span className="generated-face" style={{ backgroundPosition: `${slot * 50}% center` }} />
      ) : (
        member.avatar
      )}
    </Avatar>
  );
}

function TaskDialog({
  member,
  tasks,
  onClose,
  onSelect,
  onOther,
}: {
  member: Member | null;
  tasks: Task[];
  onClose: () => void;
  onSelect: (task: Task) => void;
  onOther: () => void;
}) {
  return (
    <Dialog
      open={!!member}
      onClose={onClose}
      fullWidth
      PaperProps={{ className: 'rounded-dialog' }}
    >
      <DialogTitle>
        Elige una tarea{' '}
        <Typography variant="body2" color="text.secondary">
          ¡Mira el dibujo, elige y gana una estrella!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div className="task-list">
          {tasks.map((t) => (
            <button className="task-row" key={t.id} onClick={() => onSelect(t)}>
              <span className="task-emoji task-emoji-big" aria-hidden="true">
                {t.icon}
              </span>
              <span className="task-copy">
                <small>{t.description}</small>
                <b>{t.title}</b>
              </span>
              <b className="task-reward">+{money(t.amountCents)}</b>
            </button>
          ))}
          <button className="task-row other-task" onClick={onOther}>
            <span className="task-emoji">＋</span>
            <span className="task-copy">
              <b>Otro</b>
              <small>Añadir una tarea personalizada</small>
            </span>
            <span className="chooser-arrow">›</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
