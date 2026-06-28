import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTransferErrorMessage(errorMsg: string, t: (key: string) => string): string {
  if (!errorMsg) return t('unexpectedError');
  
  if (errorMsg.includes('PENDING_TRANSFER_EXISTS')) {
    return t('pendingTransferExists');
  }
  if (errorMsg.includes('ONLY_PENDING_REQUESTS_CAN_BE_DELETED')) {
    return t('onlyPendingRequestsCanBeDeleted');
  }
  if (errorMsg.includes('Folder must be DRAFTED to request transfer')) {
    return t('Folder must be DRAFTED to request transfer');
  }
  if (errorMsg.includes('Folder not found')) {
    return t('Folder not found');
  }
  if (errorMsg.includes('Handler not found')) {
    return t('Handler not found');
  }
  if (errorMsg.includes('Current user not found')) {
    return t('Current user not found');
  }
  if (errorMsg.includes('Status must be ACCEPTED or REJECTED')) {
    return t('Status must be ACCEPTED or REJECTED');
  }
  if (errorMsg.includes('User must be authenticated')) {
    return t('User must be authenticated');
  }
  if (errorMsg.includes('RequestTransfer not found') || errorMsg.includes('requestTransferNotFound')) {
    return t('requestTransferNotFound');
  }

  const translated = t(errorMsg);
  return translated === errorMsg ? t('unexpectedError') : translated;
}
