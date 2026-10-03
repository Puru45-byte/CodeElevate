import React from "react";
import Link from "next/link";
import { Task, Submission } from "@/types/database";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";

interface TaskCardProps {
  task: Task;
  enrollmentId: string;
  submission?: Submission;
  isUnlocked?: boolean;
}

export function TaskCard({
  task,
  enrollmentId,
  submission,
  isUnlocked = true,
}: TaskCardProps) {
  const isCompleted = submission?.status === "APPROVED";
  const isUnderReview = submission?.status === "UNDER_REVIEW";
  const taskNumber = task.position || task.task_number || 1;
  const deadlineDays = task.deadline_days_after_start || task.deadline_days || 7;

  return (
    <Card className="flex flex-col justify-between rounded-2xl border-slate-200/80 bg-white transition-all duration-200 hover:border-blue-200 hover:shadow-card-hover">
      <div>
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              Task #{taskNumber}
            </span>
            {submission ? (
              <StatusBadge status={submission.status} />
            ) : isCompleted ? (
              <StatusBadge status="COMPLETED" />
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {deadlineDays} days
              </span>
            )}
          </div>

          <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
            {task.title}
          </h3>
        </CardHeader>

        <CardContent className="p-5 pt-0 pb-3">
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
            {task.description}
          </p>

          {task.requirements && task.requirements.length > 0 && (
            <div className="mt-3.5 space-y-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Key Deliverables
              </span>
              <ul className="mt-1 space-y-1 text-xs text-slate-600">
                {task.requirements.slice(0, 2).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="p-5 pt-2 border-t border-slate-50">
        <Link
          href={`/my-learning/${enrollmentId}/task/${task.id}`}
          className="w-full"
        >
          <Button
            size="sm"
            variant={isCompleted ? "outline" : isUnderReview ? "secondary" : "default"}
            className="w-full gap-1.5 font-semibold"
            disabled={!isUnlocked}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                View Completed Task
              </>
            ) : isUnderReview ? (
              <>
                <Clock className="w-4 h-4 text-amber-600" />
                Under Review
              </>
            ) : (
              <>
                <span>View & Submit Task</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
