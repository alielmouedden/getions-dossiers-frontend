# Justice Hub - Plateforme de Gestion des Affaires Judiciaires

Une solution web moderne, sécurisée et performante conçue pour le **Ministère de la Justice** afin d'optimiser l'organisation, le suivi et le transfert sécurisé des dossiers judiciaires entre les différents agents (gestionnaires, greffiers, greffiers d'audience et archivistes).

---

## 🌟 Fonctionnalités Principales

- **Tableau de Bord Dynamique (Dashboard)** : Statistiques clés en temps réel, diagrammes analytiques de l'activité mensuelle, répartition des transferts par statut et des utilisateurs par rôle.
- **Gestion des Utilisateurs** : Annuaire complet et gestion des comptes utilisateurs (création, modification, désactivation) avec rôles de sécurité spécifiques :
  - **Gestionnaire (MANAGER / Admin)** : Contrôle total du système.
  - **Greffier (CLERK)** : Gestion et transfert des dossiers.
  - **Greffier d'Audience (SESSION_CLERK)** : Suivi et traitement lors des sessions d'audience.
  - **Responsable des Archives (ARCHIVE_OFFICER)** : Archivage définitif des dossiers.
- **Gestion des Dossiers** : Création et édition de fiches de dossiers (numéro, symbole, année, créateur) avec contrôle des états de vie.
- **Système de Transfert & d'Aiguillage Sécurisé** : Workflow de transfert de dossiers avec traçabilité complète de l'historique et des statuts (En attente, Reçu, Terminé).
- **Internationalisation Complète (i18n)** : Support bilingue natif en **Français** et **Arabe (RTL)**.
- **Journal d'Audit Système (Logs)** : Suivi en temps réel de toutes les actions clés du système (connexions, modifications, transferts).

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React + TypeScript + Vite
- **Styling** : Tailwind CSS + Shadcn UI
- **State Management & API Querying** : React Query (TanStack Query) + Fetch Client
- **Internationalization** : i18next
- **Icons** : Lucide React
- **Visualisations** : Recharts

### Backend
- **Framework** : Spring Boot 3.x (Java 17)
- **Sécurité** : Spring Security (JWT)
- **Persistance** : Spring Data JPA / Hibernate
- **Base de données** : Base de données relationnelle (ex: H2 / MySQL)

---

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** (v18+)
- **JDK 17** ou supérieur
- **Maven** (pour le backend)

---

### Étape 1 : Démarrer le Backend Spring Boot

1. Naviguez vers le répertoire du backend :
   ```bash
   cd gestion-dossiers
   ```
2. Installez les dépendances Maven et compilez le projet :
   ```bash
   mvn clean install
   ```
3. Lancez le serveur d'application :
   ```bash
   mvn spring-boot:run
   ```
   *Le serveur démarrera par défaut sur l'adresse `http://localhost:8080`.*

---

### Étape 2 : Démarrer le Frontend React

1. Revenez à la racine du projet et installez les paquets npm :
   ```bash
   npm install
   ```
2. Démarrez le serveur de développement local :
   ```bash
   npm run dev
   ```
   *L'application sera accessible sur `http://localhost:8081` (ou l'URL indiquée par Vite).*

---

## 🔒 Sécurité et Permissions

L'accès aux différentes ressources et pages est protégé par le middleware de sécurité au niveau du Frontend (`ProtectedRoute`) ainsi que par les contrôles d'accès basés sur les rôles dans le Backend (`Spring Security`).

---

## 📜 Licence

Tous droits réservés au **Ministère de la Justice**.
