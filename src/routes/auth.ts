import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { hashPassword } from "../utils/password";
import type { AppEnv } from "../types";

const auth = new Hono<AppEnv>();

// 注册校验规则
const registerSchema = z.object({
  email: z.email("邮箱格式不正确"),
  name: z.string().min(2, "名称至少 2 个字符"),
  password: z.string().min(6, "密码至少 6 位"),
});

auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, name, password } = c.req.valid("json");
  const db = drizzle(c.env.DB);
  // 检查邮箱是否已注册
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (existing) {
    return c.json({ error: "该邮箱已注册" }, 409);
  }
  // 哈希密码并入库
  const passwordHash = await hashPassword(password);
  const newUser = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning()
    .get();
  // 返回注册信息
  return c.json(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    201
  );
});

export default auth;
