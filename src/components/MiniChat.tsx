import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const getStatusLabel = (status: string, isAr: boolean) => {
  const upperStatus = (status || '').toUpperCase();
  if (isAr) {
    switch (upperStatus) {
      case 'CREATION': return 'إنشاء';
      case 'IN_SESSION': return 'في الجلسة';
      case 'IN_DELIBERATION': return 'في المداولة';
      case 'DRAFTED': return 'محرر';
      case 'ARCHIVED': return 'مؤرشف';
      default: return status;
    }
  } else {
    switch (upperStatus) {
      case 'CREATION': return 'Création';
      case 'IN_SESSION': return 'En Session';
      case 'IN_DELIBERATION': return 'En Délibération';
      case 'DRAFTED': return 'Rédigé';
      case 'ARCHIVED': return 'Archivé';
      default: return status;
    }
  }
};

export const MiniChat = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getWelcomeText = () => {
    return i18n.language === 'ar'
      ? "مرحباً! يرجى إدخال معرف الملف الكامل (الرقم/الرمز/السنة) للتحقق من حالته وحيازته."
      : "Bienvenue ! Veuillez saisir l'identifiant complet du dossier (Numéro/Symbole/Année) pour vérifier son statut et sa possession.";
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: getWelcomeText(),
          isUser: false,
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Update welcome message dynamically when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && !prev[0].isUser) {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: getWelcomeText(),
        };
        return updated;
      }
      return prev;
    });
  }, [i18n.language]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');

    const isAr = i18n.language === 'ar';

    if (!isAuthenticated) {
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: isAr
            ? "يرجى تسجيل الدخول أولاً للوصول إلى معلومات الملفات."
            : "Veuillez vous connecter d'abord pour accéder aux informations des dossiers.",
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
      return;
    }

    try {
      const folders = await apiClient.getFolders();
      const transfers = await apiClient.getTransfers();

      const cleanInput = userInput.trim().toLowerCase().replace(/\s+/g, '');
      const match = folders.find((f: any) => {
        const num = (f.folderNumber || '').toLowerCase().replace(/\s+/g, '');
        const sym = (f.folderSymbol || '').toLowerCase().replace(/\s+/g, '');
        const yr = f.folderYear ? String(f.folderYear) : '';
        const fullId = `${num}/${sym}/${yr}`;
        return fullId === cleanInput;
      });

      if (!match) {
        setTimeout(() => {
          const botMessage: Message = {
            id: Date.now() + 1,
            text: isAr
              ? `عذراً، لم نتمكن من العثور على أي ملف يطابق المعرف "${userInput}". يرجى التأكد من كتابة الرقم، الرمز، والسنة بشكل صحيح (مثال: 123/أ/2026).`
              : `Désolé, aucun dossier ne correspond à l'identifiant "${userInput}". Veuillez vérifier le numéro, le symbole et l'année (exemple: 123/A/2026).`,
            isUser: false,
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        return;
      }

      // Found the folder! Let's find the current holder.
      const folderTransfers = transfers.filter((t: any) => {
        return (t.folder && Number(t.folder.folderId) === Number(match.folderId)) || 
               (t.fileId === match.folderNumber);
      });

      let holderText = '';
      const statusLabel = getStatusLabel(match.statuts || '', isAr);

      if (folderTransfers.length === 0) {
        // No transfers, still with creator
        holderText = isAr
          ? `الملف حالياً بحوزة منشئه (${match.createdBy}).`
          : `Le dossier est actuellement détenu par son créateur (${match.createdBy}).`;
      } else {
        // Find latest transfer
        const latestTransfer = folderTransfers.sort((a: any, b: any) => {
          const idA = a.transferId || Number(a.id);
          const idB = b.transferId || Number(b.id);
          return idB - idA;
        })[0];

        const status = (latestTransfer.status || '').toLowerCase();
        if (status === 'pending') {
          holderText = isAr
            ? `الملف حالياً في طور التحويل من طرف ${latestTransfer.fromUser} إلى ${latestTransfer.toUser} (قيد الانتظار).`
            : `Le dossier est en cours de transfert de ${latestTransfer.fromUser} vers ${latestTransfer.toUser} (en attente).`;
        } else if (status === 'completed' || status === 'received') {
          holderText = isAr
            ? `الملف حالياً بحوزة ${latestTransfer.toUser} (تم تحويله من طرف ${latestTransfer.fromUser} بتاريخ ${latestTransfer.date}).`
            : `Le dossier est actuellement détenu par ${latestTransfer.toUser} (transféré par ${latestTransfer.fromUser} le ${latestTransfer.date}).`;
        } else if (status === 'rejected') {
          holderText = isAr
            ? `تم رفض طلب التحويل إلى ${latestTransfer.toUser}. الملف حالياً بحوزة ${latestTransfer.fromUser}.`
            : `Le transfert vers ${latestTransfer.toUser} a été rejeté. Le dossier est actuellement détenu par ${latestTransfer.fromUser}.`;
        } else {
          holderText = isAr
            ? `الملف حالياً بحوزة ${latestTransfer.toUser}.`
            : `Le dossier est actuellement détenu par ${latestTransfer.toUser}.`;
        }
      }

      const responseText = isAr
        ? `مرحباً،\n\nلقد تم العثور على الملف المطلوب بنجاح. إليك التفاصيل:\n\n• معرف الملف: ${match.folderNumber}/${match.folderSymbol}/${match.folderYear || ''}\n• الحالة الحالية للملف: ${statusLabel}\n• الحيازة الحالية: ${holderText}`
        : `Bonjour,\n\nLe dossier recherché a été trouvé avec succès. Voici les détails :\n\n• Identifiant : ${match.folderNumber}/${match.folderSymbol}/${match.folderYear || ''}\n• Statut actuel : ${statusLabel}\n• Détenteur actuel : ${holderText}`;

      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: responseText,
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);

    } catch (error) {
      console.error(error);
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: isAr
            ? "عذراً، حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى لاحقاً."
            : "Désolé, une erreur est survenue lors de la récupération des données. Veuillez réessayer plus tard.",
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 end-6 w-14 h-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 end-6 w-80 md:w-96 shadow-2xl z-50 border-border">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-3 px-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('chatTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t('chatWelcome')}
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                          msg.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatPlaceholder')}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
