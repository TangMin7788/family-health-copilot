import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Report } from "@/lib/api";
import { formatDate, getUrgencyColor, getUrgencyIcon, getVisibilityLabel } from "@/lib/utils";
import { FileText, Clock, Eye } from "lucide-react";

interface ReportCardProps {
  report: Report;
  onView: (id: number) => void;
}

export function ReportCard({ report, onView }: ReportCardProps) {
  return (
    <Card className="group hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Report #{report.id}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(report.created_at)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="default">
                👤 {report.owner}
              </Badge>
              <Badge variant="info">
                {getVisibilityLabel(report.visibility)}
              </Badge>
              <Badge className={getUrgencyColor(report.urgency)}>
                {getUrgencyIcon(report.urgency)} {report.urgency}
              </Badge>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2">
              {report.report_text?.substring(0, 150)}...
            </p>
          </div>

          {/* Right side - Action button */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => onView(report.id)}
              variant="outline"
              size="sm"
              className="group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-cyan-600 group-hover:text-white group-hover:border-transparent transition-all duration-300"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
