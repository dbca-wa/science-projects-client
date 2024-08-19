import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

const EmailStaffMemberContent = ({
  kind,
  // first_name,
  // last_name,
  name,
  email,
}: {
  kind: "drawer" | "dialog";
  name: string;
  // first_name: string;
  // last_name: string;
  email: string;
}) => {
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [canSend, setCanSend] = useState(false);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      email,
      senderEmail,
      message,
    });
  };

  useEffect(() => {
    if (senderEmail && message) {
      setCanSend(true);
    } else {
      setCanSend(false);
    }
  }, [message, senderEmail]);

  return (
    <form onSubmit={sendEmail} className="text-slate-800">
      <Label htmlFor="email">Your Email</Label>
      <Input
        type="email"
        id="email"
        placeholder="Enter your email addresss"
        value={senderEmail}
        onChange={(e) => setSenderEmail(e.target.value)}
        className="mt-1"
      />
      <p className="mb-2 p-1 text-xs text-muted-foreground">
        You should verify that you have typed your email address correctly
        before sending the message, otherwise we cannot reply.
      </p>
      <Label>Your Message</Label>
      <Textarea
        className="mt-1"
        placeholder="Type your message here."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="mb-2 p-1 text-xs text-muted-foreground">
        {`Your message will be emailed to ${name}.`}
      </p>
      <div className="flex w-full justify-end">
        {kind === "drawer" && (
          <DrawerClose asChild className="mr-3">
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        )}

        <Button type="submit" disabled={!canSend}>
          Send
        </Button>
      </div>
    </form>
  );
};
export default EmailStaffMemberContent;
