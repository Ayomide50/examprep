import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import moment from "moment";
import { ArrowRight, Bell, CalendarCheck, CheckCheck, Flame, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReminderSettingsCard from "@/components/student/ReminderSettingsCard";

const TYPE_META = {
  daily: { icon: CalendarCheck, tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
  streak: { icon: Flame, tone: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" },
  milestone: { icon: Trophy, tone: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300" },
  weekly: { icon: TrendingUp, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
};

export default function Notifications() {
  const { profile, notifications } = useOutletContext();
  const { items, unread, loading, markAllRead, refresh } = notifications;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Study reminders, streak alerts and your weekly progress.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No reminders yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Study today and we'll keep you on track with daily nudges, streak alerts and weekly reports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.daily;
            const Icon = meta.icon;
            return (
              <Card
                key={item.id}
                className={item.is_read ? "" : "border-primary/40 bg-primary/[0.03]"}
              >
                <CardContent className="p-4 flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.tone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">
                        {item.title}
                        {!item.is_read && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-2 align-middle" />
                        )}
                      </p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {moment(item.created_date).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                    {item.action_url && (
                      <Link
                        to={item.action_url}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-2 hover:underline"
                      >
                        {item.action_label || "Open"} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {profile && <ReminderSettingsCard profile={profile} onSaved={refresh} />}
    </div>
  );
}