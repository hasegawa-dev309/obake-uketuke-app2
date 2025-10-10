import { useState, useEffect } from 'react';

export type Ticket = {
  id: string;
  email: string;
  count: number;
  age: string;
  status: string;
  createdAt: string | number;
  ticketNo?: string;
};

const KEY = "obake_tickets_v1";
const LAST_RESET_DATE_KEY = "obake_last_reset_date";

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function checkAndResetIfNeeded() {
  const today = getTodayString();
  const lastReset = localStorage.getItem(LAST_RESET_DATE_KEY);

  if (lastReset !== today) {
    localStorage.setItem(KEY, JSON.stringify([]));
    localStorage.setItem(LAST_RESET_DATE_KEY, today);
    localStorage.setItem("current_number", "1");
    localStorage.setItem("ticket_counter", "0");
  }
}

function read(): Ticket[] {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

function write(tickets: Ticket[]): void {
  localStorage.setItem(KEY, JSON.stringify(tickets));
}

export const Store = {
  all(): Ticket[] {
    checkAndResetIfNeeded();
    return read();
  },
  add(t: Ticket) {
    checkAndResetIfNeeded();
    const list = read();
    list.unshift(t);
    write(list);
  },
  update(id: string, patch: Partial<Ticket>) {
    checkAndResetIfNeeded();
    const list = read().map(x => x.id===id ? {...x, ...patch} : x);
    write(list);
  },
  remove(id: string) {
    checkAndResetIfNeeded();
    write(read().filter(x=>x.id!==id));
  },
  nextNumber(): string {
    checkAndResetIfNeeded();
    const counter = Number(localStorage.getItem("ticket_counter") || "0");
    const nextCounter = counter + 1;
    localStorage.setItem("ticket_counter", String(nextCounter));
    return String(nextCounter);
  }
};