import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { memberAvatars, memberSlug } from '@/lib/member-names';

export async function POST(request: Request) {
  if (!(await isAdminAuthorized(request)))
    return NextResponse.json({ error: 'Introduce el PIN de padres.' }, { status: 403 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del miembro.' }, { status: 400 });
  }
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const age = body?.age === '' || body?.age == null ? null : Number(body.age);
  const avatar = body?.avatar ?? memberAvatars[0];
  if (!name || name.length > 40 || !memberSlug(name)) {
    return NextResponse.json(
      { error: 'Escribe un nombre de hasta 40 caracteres que incluya letras o números.' },
      { status: 400 },
    );
  }
  if (age !== null && (!Number.isInteger(age) || age < 1 || age > 18)) {
    return NextResponse.json({ error: 'Indica una edad entre 1 y 18 años.' }, { status: 400 });
  }
  if (!memberAvatars.includes(avatar))
    return NextResponse.json({ error: 'Selecciona un avatar de la lista.' }, { status: 400 });

  const member = db
    .transaction(() => {
      const names = db.prepare('SELECT name FROM members').all() as { name: string }[];
      if (names.some((existing) => memberSlug(existing.name) === memberSlug(name))) return null;
      const id = Number(
        db.prepare('INSERT INTO members (name,avatar,age) VALUES (?,?,?)').run(name, avatar, age)
          .lastInsertRowid,
      );
      const goalId = Number(
        db
          .prepare('INSERT INTO investments (member_id,name,icon,balance_cents) VALUES (?,?,?,0)')
          .run(id, 'Mi primer ahorro', '🌟').lastInsertRowid,
      );
      return {
        id,
        name,
        avatar,
        age,
        cashCents: 0,
        investmentCents: 0,
        investments: [{ id: goalId, name: 'Mi primer ahorro', icon: '🌟', balanceCents: 0 }],
      };
    })
    .immediate();
  if (!member)
    return NextResponse.json(
      {
        error:
          'Ya existe un miembro con ese nombre o un nombre equivalente. Añade un apellido para distinguirlo.',
      },
      { status: 409 },
    );
  return NextResponse.json(member, { status: 201 });
}
export async function GET() {
  const members = db
    .prepare(
      'SELECT id,name,avatar,age,cash_cents AS cashCents,investment_cents AS investmentCents FROM members ORDER BY id',
    )
    .all() as {
    id: number;
    name: string;
    avatar: string;
    age: number | null;
    cashCents: number;
    investmentCents: number;
  }[];
  const goals = db
    .prepare(
      'SELECT id,member_id AS memberId,name,icon,balance_cents AS balanceCents FROM investments ORDER BY id',
    )
    .all() as { id: number; memberId: number; name: string; icon: string; balanceCents: number }[];
  const withGoals = members.map((member) => ({
    ...member,
    investments: goals.filter((goal) => goal.memberId === member.id),
  }));
  return NextResponse.json(withGoals);
}
