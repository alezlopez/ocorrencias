import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Image, ExternalLink } from "lucide-react";
import { WhatsAppTemplate } from "./WhatsAppTemplates";

interface WhatsAppPreviewProps {
  text: string;
  studentName?: string;
  template?: WhatsAppTemplate | null;
  link?: string;
}

export const WhatsAppPreview = ({ text, studentName, template, link }: WhatsAppPreviewProps) => {
  let previewText = text || "";
  if (studentName) {
    previewText = previewText.replace(/\{\{NOME_ALUNO\}\}/g, studentName);
  }
  const today = new Date().toLocaleDateString("pt-BR");
  previewText = previewText.replace(/\{\{DATA_HOJE\}\}/g, today);

  const currentTime = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyText = template?.bodyText || `Olá, tudo bem? 😁

*Temos um novo recado para você.*

{{1}}

Atenciosamente,

Coordenação do Colégio Zampieri.`;

  let renderedBody = bodyText.replace("{{1}}", previewText || "");
  if (link) {
    renderedBody = renderedBody.replace("{{2}}", link);
  }

  const isMedia = template?.type === "media";
  const isLink = template?.type === "link";

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          Preview do WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-[320px] rounded-2xl border-2 border-border overflow-hidden shadow-elegant">
          <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "#075E54" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CZ</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Colégio Zampieri</p>
              <p className="text-white/70 text-xs">online</p>
            </div>
          </div>

          <div
            className="p-3 min-h-[350px] flex flex-col justify-end"
            style={{
              backgroundColor: "#ECE5DD",
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c3ba' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          >
            <div className="max-w-[85%] self-start">
              <div
                className="rounded-lg rounded-tl-none px-3 py-2 text-sm shadow-sm relative"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                {isMedia && (
                  <div className="mb-2 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <Image className="h-8 w-8" />
                      <span className="text-xs">Mídia anexada</span>
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                  {renderedBody || (
                    <span className="italic text-gray-400">
                      Digite a mensagem ao lado...
                    </span>
                  )}
                </p>

                {isLink && link && (
                  <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs text-blue-600 truncate">{link}</span>
                    </div>
                  </div>
                )}

                <p className="text-right mt-1" style={{ fontSize: "10px", color: "#8E8E8E" }}>
                  {currentTime} ✓✓
                </p>
              </div>
            </div>
          </div>
        </div>

        {studentName && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Prévia com dados de: <strong>{studentName}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
