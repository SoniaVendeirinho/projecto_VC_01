import { supabase } from "@/integrations/supabase/client";

export async function registarXP(userId: string, xpAddict: number) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: prof } = await supabase
    .from("profiles")
    .select("xp, current_streak, longest_streak, last_activity_date")
    .eq("id", userId)
    .maybeSingle();
  if (!prof) return;

  let streak = prof.current_streak ?? 0;
  const last = prof.last_activity_date;
  if (last !== today) {
    if (last) {
      const diff = (new Date(today).getTime() - new Date(last).getTime()) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
  }
  const longest = Math.max(prof.longest_streak ?? 0, streak);

  await supabase
    .from("profiles")
    .update({
      xp: (prof.xp ?? 0) + xpAddict,
      current_streak: streak,
      longest_streak: longest,
      last_activity_date: today,
    })
    .eq("id", userId);
}
