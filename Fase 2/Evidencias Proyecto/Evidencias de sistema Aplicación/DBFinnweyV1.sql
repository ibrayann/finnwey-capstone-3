-- ================================================
-- Finwey - Database Schema
-- ================================================


-- ========== PASO 1: Extensiones necesarias ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== PASO 2: Catálogos Base ==========
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code VARCHAR(3) UNIQUE NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'CLP',
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(region_id, name)
);

CREATE TABLE genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE employment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE education_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE marital_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE income_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_amount NUMERIC NOT NULL,
    max_amount NUMERIC,
    display_label TEXT NOT NULL,
    country_id UUID REFERENCES countries(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('free', 'medium', 'pro')),
    price NUMERIC NOT NULL DEFAULT 0, -- CLP
    billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    features JSONB NOT NULL DEFAULT '{}',
    max_budgets INTEGER,
    max_goals INTEGER,
    max_transactions_per_month INTEGER,
    has_advanced_reports BOOLEAN DEFAULT FALSE,
    has_ai_insights BOOLEAN DEFAULT FALSE,
    has_export_features BOOLEAN DEFAULT FALSE,
    has_priority_support BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 3: Usuarios ==========
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender_id UUID REFERENCES genders(id),
    city_id UUID REFERENCES cities(id),
    country_id UUID REFERENCES countries(id),
    employment_status_id UUID REFERENCES employment_status(id),
    education_level_id UUID REFERENCES education_levels(id),
    marital_status_id UUID REFERENCES marital_status(id),
    income_range_id UUID REFERENCES income_ranges(id),
    exact_income NUMERIC,
    household_size INTEGER DEFAULT 1,
    current_subscription_id UUID REFERENCES subscription_plans(id),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    preferences_completed BOOLEAN DEFAULT FALSE,
    preferences_completed_at TIMESTAMPTZ,
    timezone TEXT DEFAULT 'UTC',
    language_code VARCHAR(5) DEFAULT 'es',
    currency_preference VARCHAR(3) DEFAULT 'CLP',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
);

-- ========== PASO 3.1: Suscripciones ==========
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'trial')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    payment_provider TEXT,
    billing_address JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 3.2: Historial de Ingresos ==========
CREATE TABLE user_income_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency_code VARCHAR(3) DEFAULT 'USD',
    income_type TEXT DEFAULT 'salary' CHECK (income_type IN ('salary', 'freelance', 'business', 'investment', 'government', 'other')),
    period_start DATE NOT NULL,
    period_end DATE,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'one_time')),
    source_description TEXT,
    is_estimated BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start, income_type)
);

-- ========== PASO 4: Categorías y Transacciones ==========
CREATE TABLE transaction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'savings')),
    is_active BOOLEAN DEFAULT TRUE,
);

CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    icon TEXT,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(category_id, name)
);

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'debit_card', 'credit_card')),
    is_active BOOLEAN DEFAULT TRUE
);

-- ========== PASO 5: Transacciones Recurrentes ==========
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type_id UUID NOT NULL REFERENCES transaction_types(id),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency_code VARCHAR(3) DEFAULT 'USD',
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannually', 'yearly')),
    frequency_interval INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    auto_create BOOLEAN DEFAULT FALSE,
    auto_create_days_before INTEGER DEFAULT 0,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_days_before INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 6: Transacciones ==========
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type_id UUID NOT NULL REFERENCES transaction_types(id),
    merchant_name TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    original_amount NUMERIC,
    currency_code VARCHAR(3) DEFAULT 'USD',
    original_currency_code VARCHAR(3),
    exchange_rate NUMERIC,
    transaction_date DATE NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    description TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    tags TEXT[],
    receipt_required BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2),
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ocr', 'bank_sync', 'recurring', 'api')),
    external_transaction_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 7: Recibos ==========
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    thumbnail_url TEXT,
    ocr_data JSONB,
    extracted_data JSONB,
    processing_error TEXT,
    confidence_score DECIMAL(3,2),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- ========== PASO 8: Historial de Cambios Recurrentes ==========
CREATE TABLE recurring_transaction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_transaction_id UUID NOT NULL REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 9: Metas Financieras ==========
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
    currency_code VARCHAR(3) DEFAULT 'USD',
    target_date DATE NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    category_id UUID REFERENCES categories(id),
    goal_type TEXT DEFAULT 'savings' CHECK (goal_type IN ('savings', 'debt_payoff', 'investment', 'emergency_fund', 'purchase', 'other')),
    auto_save_enabled BOOLEAN DEFAULT FALSE,
    auto_save_amount NUMERIC DEFAULT 0,
    auto_save_frequency TEXT CHECK (auto_save_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    auto_save_source_account UUID,
    reminder_frequency TEXT DEFAULT 'weekly' CHECK (reminder_frequency IN ('none', 'daily', 'weekly', 'monthly')),
    milestone_alerts BOOLEAN DEFAULT TRUE,
    completion_reward TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL,
    type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'automatic', 'transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    percentage INTEGER NOT NULL CHECK (percentage BETWEEN 0 AND 100),
    amount_threshold NUMERIC NOT NULL,
    milestone_name TEXT,
    achieved_at TIMESTAMPTZ,
    celebration_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 10: Presupuestos ==========
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency_code VARCHAR(3) DEFAULT 'USD',
    period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold NUMERIC DEFAULT 0.8 CHECK (alert_threshold BETWEEN 0 AND 1),
    warning_threshold NUMERIC DEFAULT 0.9 CHECK (warning_threshold BETWEEN 0 AND 1),
    rollover_unused BOOLEAN DEFAULT FALSE,
    rollover_percentage NUMERIC DEFAULT 1.0 CHECK (rollover_percentage BETWEEN 0 AND 1),
    auto_adjust BOOLEAN DEFAULT FALSE,
    auto_adjust_percentage NUMERIC DEFAULT 0.05,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'exceeded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'exceeded', 'milestone')),
    threshold_percentage NUMERIC NOT NULL,
    amount_spent NUMERIC NOT NULL,
    budget_amount NUMERIC NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ
);

-- ========== PASO 11: Sistema de Preferencias==========
CREATE TABLE preference_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    phase INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE preference_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES preference_categories(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('single_choice', 'multiple_choice', 'scale', 'text', 'number', 'boolean')),
    options JSONB,
    default_value TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    validation_rules JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(category_id, question_key)
);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES preference_questions(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL,
    answer_data JSONB,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

CREATE TABLE user_preferences_cache (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    financial_profile JSONB NOT NULL DEFAULT '{}',
    spending_patterns JSONB NOT NULL DEFAULT '{}',
    notification_settings JSONB NOT NULL DEFAULT '{
        "push_enabled": true,
        "email_enabled": true,
        "budget_alerts": true,
        "goal_reminders": true,
        "weekly_reports": true,
        "monthly_reports": true,
        "tips_frequency": "daily",
        "marketing_emails": false
    }'::jsonb,
    privacy_settings JSONB NOT NULL DEFAULT '{
        "data_sharing_analytics": true,
        "data_sharing_partners": false,
        "public_profile": false
    }'::jsonb,
    risk_tolerance TEXT,
    investment_experience TEXT,
    financial_goals_summary JSONB DEFAULT '{}',
    behavioral_insights JSONB DEFAULT '{}',
    ai_personalization_data JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    cache_version INTEGER DEFAULT 1
);

-- ========== PASO 12: Sistema de Tips de IA ==========
CREATE TABLE tip_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE ai_tip_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES tip_categories(id),
    template_key TEXT UNIQUE NOT NULL,
    title_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    tip_type TEXT CHECK (tip_type IN ('general', 'expense', 'budget', 'goal', 'insight', 'warning', 'achievement', 'recommendation')),
    trigger_conditions JSONB NOT NULL,
    personalization_fields TEXT[],
    min_confidence DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES ai_tip_templates(id),
    tip_category_id UUID REFERENCES tip_categories(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tip_type TEXT CHECK (tip_type IN ('general', 'expense', 'budget', 'goal', 'insight', 'warning', 'achievement', 'recommendation')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    related_entity_type TEXT CHECK (related_entity_type IN ('transaction', 'budget', 'goal', 'category', 'recurring')),
    related_entity_id UUID,
    ai_model TEXT,
    ai_confidence DECIMAL(3,2),
    personalization_score DECIMAL(3,2),
    display_until DATE,
    max_displays INTEGER DEFAULT 5,
    current_displays INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'archived', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    first_displayed_at TIMESTAMPTZ,
    last_displayed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    action_taken_at TIMESTAMPTZ
);

CREATE TABLE tip_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip_id UUID NOT NULL REFERENCES ai_tips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_useful BOOLEAN,
    is_actionable BOOLEAN,
    feedback_text TEXT,
    feedback_tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tip_id, user_id)
);

CREATE TABLE tip_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip_id UUID NOT NULL REFERENCES ai_tips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('clicked', 'applied', 'dismissed', 'shared', 'bookmarked')),
    action_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 13: Analytics y KPIs ==========
CREATE TABLE monthly_kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_month DATE NOT NULL,
    total_income NUMERIC DEFAULT 0,
    total_expenses NUMERIC DEFAULT 0,
    net_savings NUMERIC DEFAULT 0,
    savings_rate DECIMAL(5,2),
    top_expense_category_id UUID REFERENCES categories(id),
    top_expense_amount NUMERIC DEFAULT 0,
    budget_adherence_rate DECIMAL(5,2),
    budgets_over_limit INTEGER DEFAULT 0,
    goals_on_track INTEGER DEFAULT 0,
    goals_behind INTEGER DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    avg_transaction_amount NUMERIC DEFAULT 0,
    discretionary_spending NUMERIC DEFAULT 0,
    fixed_expenses NUMERIC DEFAULT 0,
    insights JSONB DEFAULT '{}',
    trends JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_month)
);

CREATE TABLE user_analytics_cache (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_month_spending NUMERIC DEFAULT 0,
    current_month_income NUMERIC DEFAULT 0,
    current_month_budget_usage DECIMAL(5,2) DEFAULT 0,
    active_goals_count INTEGER DEFAULT 0,
    completed_goals_count INTEGER DEFAULT 0,
    spending_trend TEXT,
    financial_health_score DECIMAL(5,2),
    risk_indicators JSONB DEFAULT '{}',
    spending_patterns JSONB DEFAULT '{}',
    last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PASO 14: Reportes y Exportaciones ==========
CREATE TABLE export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type TEXT CHECK (export_type IN ('csv', 'pdf', 'xlsx', 'json')),
    data_type TEXT CHECK (data_type IN ('transactions', 'budgets', 'goals', 'analytics', 'full_report')),
    filters JSONB DEFAULT '{}',
    date_range_start DATE,
    date_range_end DATE,
    include_receipts BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    file_url TEXT,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    error_message TEXT,
    processing_started_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ========== PASO 15: Sistema de Notificaciones ==========
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('push', 'email', 'in_app', 'sms')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    personalization_fields TEXT[],
    trigger_conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id),
    type TEXT NOT NULL CHECK (type IN ('budget_alert', 'goal_reminder', 'tip', 'achievement', 'system', 'promotion', 'security', 'payment')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT CHECK (channel IN ('push', 'email', 'in_app', 'sms')),
    related_entity_type TEXT,
    related_entity_id UUID,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_clicked BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE,
    delivery_attempts INTEGER DEFAULT 0,
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- ========== PASO 16: Auditoría y Seguridad ==========
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    api_endpoint TEXT,
    request_method TEXT,
    response_status INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failed', 'password_change', 'email_change', 'suspicious_activity', 'data_export', 'account_locked')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    metadata JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

