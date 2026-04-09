-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'partner');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('casa_campo', 'apartamento');

-- CreateEnum
CREATE TYPE "ServiceClassification" AS ENUM ('alimentacion', 'limpieza', 'otros');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('nueva', 'revisada', 'convertida', 'descartada');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pendiente', 'confirmada', 'en_servicio', 'finalizada', 'cancelada');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('abono', 'total');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pendiente', 'pagado');

-- CreateEnum
CREATE TYPE "PartnerPhase" AS ENUM ('fase_1', 'fase_2');

-- CreateEnum
CREATE TYPE "PartnerPeriodStatus" AS ENUM ('pendiente', 'en_alerta', 'pagado_parcial', 'pagado', 'en_disputa');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('img', 'video');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('property', 'service');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "rooms" INTEGER,
    "price_night" DECIMAL(10,2) NOT NULL,
    "amenities" TEXT[],
    "rules" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "owner_name" TEXT NOT NULL,
    "owner_cedula" TEXT NOT NULL,
    "owner_phone" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "classification" "ServiceClassification" NOT NULL,
    "type" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "rules" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "property_id" TEXT,
    "service_id" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_cedula" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "date_interest" TIMESTAMP(3),
    "additional_services" TEXT[],
    "status" "LeadStatus" NOT NULL DEFAULT 'nueva',
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "property_id" TEXT,
    "service_id" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_notes" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_cedula" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,
    "additional_services" TEXT[],
    "price_total" DECIMAL(12,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pendiente',
    "observations" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "property_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "contracting_id" TEXT,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractings" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_cedula" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,
    "price_total" DECIMAL(12,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pendiente',
    "observations" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lead_id" TEXT,

    CONSTRAINT "contractings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracting_services" (
    "id" TEXT NOT NULL,
    "contracting_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "contracting_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_periods" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "revenue_total" DECIMAL(14,2) NOT NULL,
    "phase" "PartnerPhase" NOT NULL DEFAULT 'fase_1',
    "pct_applied" DECIMAL(5,2) NOT NULL,
    "amount_due" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "PartnerPeriodStatus" NOT NULL DEFAULT 'pendiente',
    "deadline_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "dispute_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "amount_pending" DECIMAL(12,2) NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "alert_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "commission_pct" DECIMAL(5,4) NOT NULL DEFAULT 0.10,
    "rules_doc_url" TEXT NOT NULL DEFAULT '',
    "notification_email" TEXT NOT NULL DEFAULT '',
    "partner_deadline_days" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "media_entity_type_entity_id_url_key" ON "media"("entity_type", "entity_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_lead_id_key" ON "reservations"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_contracting_id_key" ON "reservations"("contracting_id");

-- CreateIndex
CREATE INDEX "reservations_property_id_date_start_date_end_idx" ON "reservations"("property_id", "date_start", "date_end");

-- CreateIndex
CREATE UNIQUE INDEX "contractings_lead_id_key" ON "contractings"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracting_services_contracting_id_service_id_key" ON "contracting_services"("contracting_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_periods_month_key" ON "partner_periods"("month");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_contracting_id_fkey" FOREIGN KEY ("contracting_id") REFERENCES "contractings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractings" ADD CONSTRAINT "contractings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracting_services" ADD CONSTRAINT "contracting_services_contracting_id_fkey" FOREIGN KEY ("contracting_id") REFERENCES "contractings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracting_services" ADD CONSTRAINT "contracting_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_logs" ADD CONSTRAINT "alert_logs_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "partner_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
