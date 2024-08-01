import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const EmailStaffMemberContent = ({ email }: { email: string }) => {
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      email,
      senderEmail,
      message,
    });
  };

  return (
    <form onSubmit={sendEmail}>
      <Label htmlFor="email">Your Email</Label>
      <Input
        type="email"
        id="email"
        placeholder="Email"
        value={senderEmail}
        onChange={(e) => setSenderEmail(e.target.value)}
      />
      <p>
        You should verify that you have typed your email address correctly
        before sending the message, otherwise we will be unable to reply.
      </p>
      <Label>Your Message</Label>
      <Textarea
        placeholder="Type your message here."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
      <Button type="submit">Send</Button>
    </form>
  );
};
export default EmailStaffMemberContent;
