"use client";

import { createClient } from "./supabase";
import { Todo, Tag, Template, Achievement, Subtask } from "./types";

const supabase = createClient();

// ─── Todos ───

export async function fetchTodos(userId: string): Promise<Todo[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("todos")
    .select("*, subtasks(*), todo_tags(tag_id)")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    quadrant: row.quadrant,
    date: row.date,
    completed: row.completed,
    completedAt: row.completed_at,
    repeat: row.repeat,
    repeatDays: row.repeat_days,
    repeatDate: row.repeat_date,
    repeatMonth: row.repeat_month,
    startTime: row.start_time ? row.start_time.substring(0, 5) : undefined,
    endTime: row.end_time ? row.end_time.substring(0, 5) : undefined,
    memo: row.memo || "",
    createdAt: row.created_at,
    order: row.sort_order,
    subtasks: (row.subtasks || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
      order: s.sort_order,
    })),
    tags: (row.todo_tags || []).map((tt: any) => tt.tag_id),
  }));
}

export async function upsertTodo(userId: string, todo: Todo) {
  if (!supabase) return;
  await supabase.from("todos").upsert({
    id: todo.id,
    user_id: userId,
    title: todo.title,
    quadrant: todo.quadrant,
    date: todo.date,
    completed: todo.completed,
    completed_at: todo.completedAt,
    repeat: todo.repeat,
    repeat_days: todo.repeatDays || null,
    repeat_date: todo.repeatDate || null,
    repeat_month: todo.repeatMonth || null,
    start_time: todo.startTime || null,
    end_time: todo.endTime || null,
    memo: todo.memo,
    sort_order: todo.order,
    updated_at: new Date().toISOString(),
  });

  // Sync subtasks
  if (todo.subtasks && todo.subtasks.length > 0) {
    await supabase.from("subtasks").delete().eq("todo_id", todo.id);
    await supabase.from("subtasks").insert(
      todo.subtasks.map((s) => ({
        id: s.id,
        todo_id: todo.id,
        title: s.title,
        completed: s.completed,
        sort_order: s.order,
      }))
    );
  }

  // Sync tags
  await supabase.from("todo_tags").delete().eq("todo_id", todo.id);
  if (todo.tags && todo.tags.length > 0) {
    await supabase.from("todo_tags").insert(
      todo.tags.map((tagId) => ({ todo_id: todo.id, tag_id: tagId }))
    );
  }
}

export async function deleteTodoDb(todoId: string) {
  if (!supabase) return;
  await supabase.from("todos").delete().eq("id", todoId);
}

// ─── Tags ───

export async function fetchTags(userId: string): Promise<Tag[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));
}

export async function upsertTag(userId: string, tag: Tag) {
  if (!supabase) return;
  await supabase.from("tags").upsert({
    id: tag.id,
    user_id: userId,
    name: tag.name,
    color: tag.color,
  });
}

export async function deleteTagDb(tagId: string) {
  if (!supabase) return;
  await supabase.from("tags").delete().eq("id", tagId);
}

// ─── Templates ───

export async function fetchTemplates(userId: string): Promise<Template[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");
  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    items: t.items,
    createdAt: t.created_at,
  }));
}

export async function upsertTemplate(userId: string, template: Template) {
  if (!supabase) return;
  await supabase.from("templates").upsert({
    id: template.id,
    user_id: userId,
    name: template.name,
    items: template.items,
  });
}

export async function deleteTemplateDb(templateId: string) {
  if (!supabase) return;
  await supabase.from("templates").delete().eq("id", templateId);
}

// ─── Achievements ───

export async function fetchAchievements(userId: string): Promise<Achievement[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId);
  return (data || []).map((a: any) => ({
    type: a.type,
    unlockedAt: a.unlocked_at,
  }));
}

export async function insertAchievement(userId: string, achievement: Achievement) {
  if (!supabase) return;
  await supabase.from("achievements").insert({
    user_id: userId,
    type: achievement.type,
    unlocked_at: achievement.unlockedAt,
  });
}
