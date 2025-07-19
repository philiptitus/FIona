import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Mail, FileText, LayoutTemplate } from "lucide-react";
import { handleFetchSentEmailDetail } from "@/store/actions/sentEmailActions";
import { clearSentEmailDetail } from "@/store/slices/sentEmailSlice";
import type { RootState, AppDispatch } from "@/store/store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailId: number | null;
}

const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ open, onOpenChange, emailId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { item: email, isLoading, error } = useSelector((state: RootState) => state.sentEmail.detail);

  useEffect(() => {
    if (open && emailId) {
      dispatch(handleFetchSentEmailDetail(emailId) as any);
    }
    if (!open) {
      dispatch(clearSentEmailDetail());
    }
  }, [open, emailId, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Details
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin w-10 h-10 text-primary mb-2" />
            <div className="text-primary font-semibold">Loading email...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <XCircle className="w-12 h-12 text-red-500 mb-2 animate-pop" />
            <div className="text-red-600 font-semibold text-lg">{error}</div>
          </div>
        ) : email ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{email.subject}</span>
              {email.is_html ? (
                <Badge variant="outline" className="ml-2 flex items-center gap-1"><LayoutTemplate className="w-4 h-4" /> Template (HTML)</Badge>
              ) : (
                <Badge variant="outline" className="ml-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Content (Plain)</Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              <span>To: <span className="font-semibold text-gray-900 dark:text-gray-100">{email.recipient}</span></span>
              <span>Sent: {new Date(email.sent_at).toLocaleString()}</span>
              <span className="flex items-center gap-1">
                {email.status === "sent" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
              </span>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 min-h-[120px] max-h-96 overflow-auto shadow-inner">
              {email.is_html ? (
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: email.body }} />
              ) : (
                <pre className="whitespace-pre-wrap break-words font-sans text-base">{email.body}</pre>
              )}
            </div>
            {email.error_message && (
              <div className="flex items-center gap-2 text-red-600 text-xs mt-2 animate-fade-in">
                <XCircle className="w-4 h-4" />
                <span>{email.error_message}</span>
              </div>
            )}
          </div>
        ) : (
          <Skeleton className="h-32 w-full rounded-lg" />
        )}
        <style jsx global>{`
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.5s;
}
@keyframes pop {
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop {
  animation: pop 0.4s;
}
`}</style>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDetailModal; 