"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

interface Props {
  year: number;
  month: number; // 0-11
  onDayClick?: (date: Date) => void;
  today: Date;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.days as number[]);

export const Calendar: React.FC<Props> = ({ year, month, onDayClick, today }) => {
  const { data: streakDays = [] } = useSWR<number[]>(
    `/api/streak/logs?year=${year}&month=${month + 1}`,
    fetcher,
    { fallbackData: [] }
  );

  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build array of day numbers or null for blanks
  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  // helper
  const isStreak = (d: number) => streakDays.includes(d);
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="grid grid-cols-7 gap-2 text-center text-xs select-none">
      {["D", "S", "T", "Q", "Q", "S", "S"].map((h) => (
        <span key={h} className="text-[#8ca0ad] font-semibold">
          {h}
        </span>
      ))}
      {cells.map((d, idx) => {
        if (d === null) return <span key={idx}></span>;

        const classes = [
          "py-1 rounded-full cursor-pointer",
          isToday(d) ? "bg-[#263238] text-white" : "text-[#8ca0ad]",
          isStreak(d) ? "bg-orange-400 text-[#0f1c24] font-bold" : "",
        ].join(" ");

        return (
          <span key={idx} className={classes} onClick={() => onDayClick?.(new Date(year, month, d))}>
            {d}
          </span>
        );
      })}
    </div>
  );
};
