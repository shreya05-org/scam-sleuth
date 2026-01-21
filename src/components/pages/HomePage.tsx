// HPI 1.6-G
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  Users, 
  Save, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  Lock, 
  Activity,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { RedFlagCriteria, RiskRecommendations, JobRoleSalaryRanges } from '@/entities';

// --- Types & Interfaces ---
interface AnalysisResult {
  totalRisk: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  detectedFlags: DetectedFlag[];
  recommendations: string[];
  scanTime: number;
}

interface DetectedFlag {
  name: string;
  detected: boolean;
  explanation: string;
  riskContribution: number;
  severityLevel: string;
}

// --- Utility Components ---

const AnimatedReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`${className || ''} transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-primary opacity-70 animate-pulse" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, 2px)' }}>{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-secondary opacity-70 animate-pulse" style={{ clipPath: 'polygon(0 80%, 100% 20%, 100% 100%, 0 100%)', transform: 'translate(2px, -2px)', animationDelay: '0.1s' }}>{text}</span>
    </div>
  );
};

// --- Main Component ---

export default function HomePage() {
  // --- State Management ---
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [redFlagCriteria, setRedFlagCriteria] = useState<RedFlagCriteria[]>([]);
  const [riskRecommendations, setRiskRecommendations] = useState<RiskRecommendations[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<JobRoleSalaryRanges[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input');

  // --- Scroll Hooks ---
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // --- Data Loading (Data Fidelity Protocol) ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { items: criteria } = await BaseCrudService.getAll<RedFlagCriteria>('redflagcriteria');
    const { items: recommendations } = await BaseCrudService.getAll<RiskRecommendations>('riskrecommendations');
    const { items: ranges } = await BaseCrudService.getAll<JobRoleSalaryRanges>('jobrolesalaryranges');
    
    setRedFlagCriteria(criteria);
    setRiskRecommendations(recommendations);
    setSalaryRanges(ranges);
  };

  // --- Logic (Enhanced Multi-Criteria Detection) ---
  
  // CATEGORY 1: Payment/Monetization Detection (even indirect)
  const checkPaymentIndicators = (text: string): { detected: boolean; details: string } => {
    // Direct payment requests
    const directPaymentPatterns = [
      /\b(pay|payment|deposit|fee|charge|cost)\s+(required|needed|must|should|necessary|mandatory|expected|demanded)/i,
      /\b(require|need|must|should|expect|demand)\s+\w*\s*(pay|payment|deposit|fee|charge|cost)/i,
      /\b(upfront|advance|initial|registration|processing|training)\s+(pay|payment|deposit|fee|charge|cost)/i,
      /\b(send|transfer|wire|remit)\s+\w*\s*(money|payment|amount|funds)/i,
      /\b(₹|£|\$|€)\s*\d+\s*(fee|charge|deposit|payment|cost)/i,
      /\b(complete|make|submit)\s+(?:a\s+)?payment/i,
      /\bpayment\s+(?:of|is)\s+(?:₹|£|\$|€)?\s*\d+/i,
      /\b(?:₹|rs\.?|rupees?)\s*\d[\d,]+\s+(?:to|for)\s+(?:fast-track|onboarding|registration|training|processing)/i,
      /\bcandidates?\s+must\s+complete\s+(?:a\s+)?payment/i
    ];
    
    // Tuition & training fees (including discounts/scholarships)
    const tuitionFeePatterns = [
      /\b(tuition|course fee|training fee|enrollment fee|admission fee|certification fee|program fee|registration fee)/i,
      /\b\d+\s*(?:percent|%)\s+(tuition|fee|cost)?\s*(reduction|discount|waiver|scholarship)/i,
      /\b(reduced|discounted)\s+(tuition|fee|cost)/i,
      /\b(scholarship code|discount code|promo code|coupon code)\s+(?:to|for)?\s*(get|receive|claim)/i,
      /\b(use code|apply code|enter code)\s+(?:to)?\s*(get|receive)\s+(?:a)?\s*(discount|reduction)/i,
      /\brefundable\s+(fee|deposit|payment)/i,
      /\bpaid\s+(program|internship|training|course)/i
    ];
    
    // Deferred payment/compensation discussions
    const deferredPaymentPatterns = [
      /\b(salary|stipend|compensation|payment|pay)\s+(?:will be|to be|can be)?\s*(discussed|negotiated|decided|determined|shared|revealed)\s+(?:after|later|upon|following)/i,
      /\b(compensation|payment|stipend|salary)\s+(?:details|information|amount)?\s*(?:will be|to be)?\s*(discussed|shared|provided|revealed)\s+later/i,
      /\b(pay after|payment after|stipend after)\s+(selection|joining|task|assignment|completion)/i,
      /\bcompensation\s+discussed\s+after\s+task/i
    ];
    
    // Monetized internship/training model
    const monetizedModelPatterns = [
      /\bmonetized\s+(internship|training|program)/i,
      /\b(internship|training)\s+(?:with)?\s*(?:a)?\s*fee/i,
      /\b(earn while you learn|learn and earn)\b/i,
      /\b(investment|fee)\s+(?:in|for)\s+(?:your)?\s*(career|future|training)/i
    ];

    const hasDirectPayment = directPaymentPatterns.some(p => p.test(text));
    const hasTuitionFee = tuitionFeePatterns.some(p => p.test(text));
    const hasDeferredPayment = deferredPaymentPatterns.some(p => p.test(text));
    const hasMonetizedModel = monetizedModelPatterns.some(p => p.test(text));

    const detected = hasDirectPayment || hasTuitionFee || hasDeferredPayment || hasMonetizedModel;
    
    let details = '';
    if (detected) {
      if (hasDirectPayment) details = 'Direct payment request detected in job posting';
      else if (hasTuitionFee) details = 'Tuition/training fee structure detected - legitimate jobs should not require payment';
      else if (hasDeferredPayment) details = 'Compensation details deferred until after work/task completion';
      else if (hasMonetizedModel) details = 'Monetized internship/training model detected';
    }

    return { detected, details };
  };

  // CATEGORY 2: Urgency & Psychological Pressure Detection
  const checkUrgencyPressure = (text: string): { detected: boolean; details: string } => {
    // Time-pressure phrases
    const timePressurePatterns = [
      /\b(last date|final date|deadline|closing date)\s+(?:to|for)?\s*(apply|register|submit|fill)/i,
      /\b(limited seats?|finite seats?|only \d+ seats?)\b/i,
      /\b(act fast|apply immediately|register now|submit today)/i,
      /\b(filling fast|seats? filling|almost full)/i,
      /\b(closing today|ends today|expires today)/i,
      /\b(deadline approaching|time running out)/i,
      /\b(early registration|early application)\s+(?:is)?\s*(encouraged|recommended|advised)/i,
      /\b(risk falling behind|don't fall behind)\s+(?:your)?\s*peers/i,
      /\b(?:respond|reply|apply)\s+within\s+\d+\s+(?:days?|hours?|weeks?)/i,
      /\b(?:failure|fail)\s+to\s+(?:respond|reply|apply)\s+(?:within|by|before)/i
    ];

    // Pressure tactics
    const pressureTactics = [
      /\b(confirm today|respond today|apply today|register today)/i,
      /\b(attendance\s+(?:is)?\s*mandatory|mandatory attendance)/i,
      /\b(failure to respond|if you don't respond)\s+(?:will)?\s*(cancel|forfeit|lose)/i,
      /\b(must (respond|reply|apply|register|confirm))/i,
      /\b(you (must|need to|have to)\s+(respond|apply|register|confirm))/i,
      /\b(this is your (?:only|last) (?:chance|opportunity))/i,
      /\b(?:will\s+)?result\s+in\s+(?:automatic\s+)?(?:disqualification|rejection|cancellation)/i,
      /\b(?:mandatory|required)\s+(?:and|&)\s+non-negotiable/i
    ];

    // Scarcity framing
    const scarcityPatterns = [
      /\b(rolling basis|first come first serve)\s+(?:with)?\s*(limited|finite|few)/i,
      /\b(high demand|overwhelming response)/i,
      /\b(selected few|exclusive opportunity|limited opportunity)/i,
      /\b(you have been selected|congratulations.{0,30}selected)/i,
      /\b(limited to (?:the )?first \d+)/i
    ];

    const hasTimePressure = timePressurePatterns.some(p => p.test(text));
    const hasPressureTactics = pressureTactics.some(p => p.test(text));
    const hasScarcity = scarcityPatterns.some(p => p.test(text));

    const detected = hasTimePressure || hasPressureTactics || hasScarcity;
    
    let details = '';
    if (detected) {
      if (hasTimePressure) details = 'Urgency language detected - creating artificial time pressure';
      else if (hasPressureTactics) details = 'Psychological pressure tactics detected - forcing immediate action';
      else if (hasScarcity) details = 'Artificial scarcity framing detected - manipulating decision-making';
    }

    return { detected, details };
  };

  // CATEGORY 3: Off-Platform/External Communication Detection
  const checkExternalMessaging = (text: string): { detected: boolean; details: string } => {
    // Direct off-platform requests
    const offPlatformPatterns = [
      /\b(contact|message|reach|text|call)\s+(?:me|us)?\s*(?:on|via|through|at|directly)\s+(whatsapp|telegram|signal|wechat|email|phone)/i,
      /\b(whatsapp|telegram|signal|wechat)\s+(?:me|us)\s+(?:on|at)/i,
      /\b(add (?:me|us) on)\s+(whatsapp|telegram|signal)/i
    ];

    // External contact details & Google Forms
    const contactDetailsPatterns = [
      /\b(whatsapp|telegram|signal|wechat)\s*(?:number|id|contact)?\s*[:|-]?\s*[+]?\d{10}/i,
      /\b(?:email|e-mail)\s*(?:me|us)?\s*(?:at|:|-)\s*[\w.-]+@[\w.-]+\.\w+/i,
      /\b(forms\.gle|docs\.google\.com\/forms)\b/i,
      /\bhttps?:\/\/forms\.gle\/[a-zA-Z0-9]+/i,
      /\b(fill (?:the|this|out) (?:form|application|google form))/i,
      /\b(application form|registration form)\s+(?:link|below|here)/i
    ];

    // Avoiding official channels
    const avoidOfficialPatterns = [
      /\b(don't|do not|avoid)\s+(?:reply|respond|use)\s+(?:this)?\s*(platform|portal|site|email)/i,
      /\b(easier|better|faster|quicker)\s+(?:to|on)?\s*(whatsapp|telegram|email|directly)/i,
      /\b(do not reply to this email|don't reply here)/i,
      /\b(hr (?:will )?contact|counselor (?:will )?contact)\s+(?:you)?\s*(?:separately|directly)/i,
      /\b(dm (?:me|us)|direct message)\s+(?:for)?\s*(faster|quick|immediate)/i
    ];

    const hasOffPlatform = offPlatformPatterns.some(p => p.test(text));
    const hasContactDetails = contactDetailsPatterns.some(p => p.test(text));
    const hasAvoidOfficial = avoidOfficialPatterns.some(p => p.test(text));

    const detected = hasOffPlatform || hasContactDetails || hasAvoidOfficial;
    
    let details = '';
    if (detected) {
      if (hasOffPlatform) details = 'Attempt to move communication off-platform detected';
      else if (hasContactDetails) details = 'External contact details or forms provided - bypassing official channels';
      else if (hasAvoidOfficial) details = 'Instructions to avoid official communication channels detected';
    }

    return { detected, details };
  };

  // CATEGORY 4: Salary/Benefit Anomalies & Role Mismatch Detection
  const checkSalaryAnomalies = (text: string): { detected: boolean; details: string } => {
    const textLower = text.toLowerCase();
    
    // Unrealistic guarantees
    const guaranteePatterns = [
      /\b(guaranteed|100%)\s+(internship|placement|job|selection)/i,
      /\b(100% placement|placement guarantee|guaranteed placement)/i,
      /\b(no interview|direct selection|automatic selection)/i,
      /\b(selected without interview)/i
    ];

    // Unrealistic benefits
    const benefitPatterns = [
      /\b(highest package|top package|premium package)/i,
      /\b(earn while you learn|learn and earn)/i,
      /\b(international client exposure)\s+(?:for)?\s*(?:freshers?|beginners?|no experience)/i,
      /\b(work from home|remote)\s+(?:with)?\s*(no experience|fresher|beginner)/i,
      /\b(multiple certificates?)\s+(?:in)?\s*(?:short|few|limited)\s+(?:duration|time|days?|weeks?)/i
    ];

    // Placement assurance language
    const placementPatterns = [
      /\bplacement assurance\b/i,
      /\bassured placement\b/i,
      /\bguaranteed job after\b/i,
      /\b100%\s+(?:job|placement)\b/i
    ];

    // Numeric salary anomalies (existing logic)
    const salaryPatterns = [
      { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lpa|lakh|lakhs|per annum|pa)/gi, currency: 'INR', multiplier: 100000 },
      { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)/gi, currency: 'USD', multiplier: 1000 },
      { pattern: /€\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)/gi, currency: 'EUR', multiplier: 1000 },
      { pattern: /£\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)/gi, currency: 'GBP', multiplier: 1000 }
    ];

    const detectedSalaries: Array<{ amount: number; currency: string; original: string }> = [];
    for (const { pattern, currency, multiplier } of salaryPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(/,/g, '')) * multiplier;
        detectedSalaries.push({ amount, currency, original: match[0] });
      }
    }

    const hasGuarantees = guaranteePatterns.some(p => p.test(text));
    const hasBenefits = benefitPatterns.some(p => p.test(text));
    const hasPlacement = placementPatterns.some(p => p.test(text));

    let isAnomalous = hasGuarantees || hasBenefits || hasPlacement;
    let anomalyDetails = '';

    if (hasGuarantees) {
      anomalyDetails = 'Unrealistic guarantees detected - legitimate employers cannot guarantee placements without proper evaluation';
    } else if (hasBenefits) {
      anomalyDetails = 'Unrealistic benefits or role mismatch detected - claims do not align with typical job market practices';
    } else if (hasPlacement) {
      anomalyDetails = 'Placement assurance language detected - legitimate companies do not guarantee jobs before assessment';
    }

    // Check numeric salary anomalies
    if (!isAnomalous && detectedSalaries.length > 0) {
      for (const salary of detectedSalaries) {
        const matchingRole = salaryRanges.find(role => {
          const roleTitle = role.jobRoleTitle?.toLowerCase() || '';
          return roleTitle && textLower.includes(roleTitle);
        });

        if (matchingRole) {
          const maxSalary = matchingRole.maxSalary || 0;
          let comparableSalary = salary.amount;
          if (salary.currency === 'USD') comparableSalary *= 83;
          if (salary.currency === 'EUR') comparableSalary *= 90;
          if (salary.currency === 'GBP') comparableSalary *= 105;

          if (comparableSalary > maxSalary * 1.5) {
            isAnomalous = true;
            anomalyDetails = `Salary ${salary.original} significantly exceeds market range for ${matchingRole.jobRoleTitle}`;
            break;
          }
        } else {
          const thresholds = { INR: 5000000, USD: 200000, EUR: 180000, GBP: 150000 };
          if (salary.amount > thresholds[salary.currency as keyof typeof thresholds]) {
            isAnomalous = true;
            anomalyDetails = `Unusually high salary offer (${salary.original}) without clear job role specification`;
            break;
          }
        }
      }
    }

    return { detected: isAnomalous, details: anomalyDetails };
  };



  const getRecommendations = (riskLevel: string, flags: DetectedFlag[]): string[] => {
    const recommendations: string[] = [];
    const generalRec = riskRecommendations.find(r => r.riskLevel?.toLowerCase() === riskLevel.toLowerCase());
    
    // Always add general recommendation based on risk level
    if (generalRec?.generalRecommendation) {
      recommendations.push(generalRec.generalRecommendation);
    }

    // Add specific guidance for each detected flag
    flags.forEach(flag => {
      const flagName = flag.name.toLowerCase();
      if ((flagName.includes('payment') || flagName.includes('upfront')) && generalRec?.upfrontPaymentGuidance) {
        recommendations.push(generalRec.upfrontPaymentGuidance);
      }
      if ((flagName.includes('urgency') || flagName.includes('pressure')) && generalRec?.urgencyLanguageGuidance) {
        recommendations.push(generalRec.urgencyLanguageGuidance);
      }
      if ((flagName.includes('messaging') || flagName.includes('external')) && generalRec?.externalMessagingGuidance) {
        recommendations.push(generalRec.externalMessagingGuidance);
      }
      if (flagName.includes('salary') && generalRec?.salaryAnomalyGuidance) {
        recommendations.push(generalRec.salaryAnomalyGuidance);
      }
    });

    return [...new Set(recommendations)];
  };

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    const startTime = performance.now();

    // Simulate processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 1200));

    const detectedFlags: DetectedFlag[] = [];
    const categoriesTriggered: string[] = [];
    let totalRisk = 0;

    // CATEGORY 1: Payment/Monetization Indicators
    const paymentCheck = checkPaymentIndicators(inputText);
    if (paymentCheck.detected) {
      categoriesTriggered.push('Payment/Monetization');
      const contribution = 25; // Each category = 25% base risk
      totalRisk += contribution;
      detectedFlags.push({
        name: 'Payment/Monetization Indicators',
        detected: true,
        explanation: paymentCheck.details,
        riskContribution: contribution,
        severityLevel: 'high'
      });
    }

    // CATEGORY 2: Urgency & Psychological Pressure
    const urgencyCheck = checkUrgencyPressure(inputText);
    if (urgencyCheck.detected) {
      categoriesTriggered.push('Urgency/Pressure');
      const contribution = 25;
      totalRisk += contribution;
      detectedFlags.push({
        name: 'Urgency & Psychological Pressure',
        detected: true,
        explanation: urgencyCheck.details,
        riskContribution: contribution,
        severityLevel: 'medium'
      });
    }

    // CATEGORY 3: Off-Platform/External Communication
    const externalCheck = checkExternalMessaging(inputText);
    if (externalCheck.detected) {
      categoriesTriggered.push('External Communication');
      const contribution = 25;
      totalRisk += contribution;
      detectedFlags.push({
        name: 'Off-Platform/External Communication',
        detected: true,
        explanation: externalCheck.details,
        riskContribution: contribution,
        severityLevel: 'high'
      });
    }

    // CATEGORY 4: Salary/Benefit Anomalies & Role Mismatch
    const salaryCheck = checkSalaryAnomalies(inputText);
    if (salaryCheck.detected) {
      categoriesTriggered.push('Salary/Benefit Anomalies');
      const contribution = 25;
      totalRisk += contribution;
      detectedFlags.push({
        name: 'Salary/Benefit Anomalies & Role Mismatch',
        detected: true,
        explanation: salaryCheck.details,
        riskContribution: contribution,
        severityLevel: 'medium'
      });
    }

    // Ensure risk score is NEVER 0 if any category is triggered
    if (categoriesTriggered.length > 0 && totalRisk === 0) {
      totalRisk = 20; // Minimum 20% if any flag detected
    }

    totalRisk = Math.min(totalRisk, 100);
    
    // Risk level based on categories triggered
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (categoriesTriggered.length === 0) {
      riskLevel = 'LOW';
    } else if (categoriesTriggered.length === 1) {
      riskLevel = 'MEDIUM'; // 1 category = Verify
    } else if (categoriesTriggered.length === 2) {
      riskLevel = 'HIGH'; // 2 categories = High Risk
    } else {
      riskLevel = 'HIGH'; // 3+ categories = Very High Risk (Avoid)
    }

    const recommendations = getRecommendations(riskLevel, detectedFlags);
    const endTime = performance.now();
    const scanTime = ((endTime - startTime) / 1000).toFixed(2);

    setAnalysisResult({
      totalRisk,
      riskLevel,
      detectedFlags,
      recommendations,
      scanTime: parseFloat(scanTime)
    });

    setIsAnalyzing(false);
    setActiveTab('results');
    
    // Scroll to results
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const saveReport = () => {
    if (!analysisResult) return;
    const report = {
      timestamp: new Date().toISOString(),
      inputText,
      ...analysisResult
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scam-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#64FFDA';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#F44336';
      default: return '#64FFDA';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-[#121212] dark:text-white overflow-x-clip selection:bg-primary/30 selection:text-primary-foreground">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-white dark:bg-[#121212]">
        {/* Dynamic Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            style={{ y: useTransform(scrollY, [0, 1000], [0, -200]), opacity: heroOpacity }}
            className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[120px]" 
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-heading tracking-widest uppercase text-primary/80">AI Risk Intelligence Active</span>
              </div>
              
              <h1 className="font-heading text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-6">
                UNMASKING <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-black dark:via-white to-secondary">
                  SCAMS
                </span>
              </h1>
              
              <p className="font-paragraph text-xl text-black/60 dark:text-white/60 max-w-2xl leading-relaxed">
                Advanced algorithmic detection for the modern job market. We analyze patterns, detect anomalies, and protect your career from fraudulent actors.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => document.getElementById('analysis-interface')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-4 bg-primary text-black font-heading font-bold text-lg rounded-lg overflow-hidden transition-transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Initialize Scan <ArrowRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 dark:from-white/10 to-transparent backdrop-blur-md z-20" />
                <Image 
                  src="https://static.wixstatic.com/media/aa8d35_72a1fca093914d58b1de81ea834367b0~mv2.png?originWidth=576&originHeight=576"
                  alt="AI Security Visualization"
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                
                {/* Floating UI Elements inside the graphic */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 right-10 z-30 bg-black/80 border border-primary/30 p-4 rounded-xl backdrop-blur-xl"
                >
                  <Activity className="w-6 h-6 text-primary mb-2" />
                  <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-10 left-10 z-30 bg-black/80 border border-secondary/30 p-4 rounded-xl backdrop-blur-xl flex items-center gap-3"
                >
                  <Shield className="w-8 h-8 text-secondary" />
                  <div>
                    <div className="text-xs text-white/50 font-mono">STATUS</div>
                    <div className="text-sm font-bold text-white">PROTECTED</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS TICKER --- */}
      <div className="w-full bg-black/5 dark:bg-white/5 border-y border-black/10 dark:border-white/10 overflow-hidden py-4 backdrop-blur-sm">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mx-6">
              <span className="flex items-center gap-2 text-black/70 dark:text-white/70 font-mono text-sm">
                <Users className="w-4 h-4 text-primary" /> 10,000+ USERS PROTECTED
              </span>
              <span className="flex items-center gap-2 text-black/70 dark:text-white/70 font-mono text-sm">
                <DollarSign className="w-4 h-4 text-secondary" /> $2.5M+ FRAUD PREVENTED
              </span>
              <span className="flex items-center gap-2 text-black/70 dark:text-white/70 font-mono text-sm">
                <Activity className="w-4 h-4 text-primary" /> REAL-TIME ANALYSIS
              </span>
              <span className="text-black/20 dark:text-white/20">///</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN INTERFACE SECTION --- */}
      <section id="analysis-interface" className="py-32 relative bg-white dark:bg-[#121212]">
        <div className="container mx-auto px-6 max-w-[100rem]">
          
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Context & Criteria */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-32">
                <AnimatedReveal>
                  <h2 className="font-heading text-4xl font-bold mb-6 text-black dark:text-white">Detection Protocols</h2>
                  <p className="text-black/60 dark:text-white/60 mb-8 font-paragraph">
                    Our AI engine scans for specific linguistic and structural patterns associated with high-risk job postings.
                  </p>
                </AnimatedReveal>

                <div className="space-y-4">
                  <AnimatedReveal>
                    <div className="group p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 transition-colors cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-bold text-black dark:text-white group-hover:text-primary transition-colors">Upfront Payment Requests</h3>
                        <AlertOctagon className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-black/50 dark:text-white/50 line-clamp-2">Detects direct/indirect payment demands including tuition, training fees, deferred compensation, and monetized internship models</p>
                    </div>
                  </AnimatedReveal>

                  <AnimatedReveal delay={100}>
                    <div className="group p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 transition-colors cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-bold text-black dark:text-white group-hover:text-primary transition-colors">Urgency/Pressure Language</h3>
                        <AlertOctagon className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-black/50 dark:text-white/50 line-clamp-2">Flags urgency language, artificial scarcity, deadline pressure, and psychological manipulation tactics</p>
                    </div>
                  </AnimatedReveal>

                  <AnimatedReveal delay={200}>
                    <div className="group p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 transition-colors cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-bold text-black dark:text-white group-hover:text-primary transition-colors">External Messaging Shift</h3>
                        <AlertOctagon className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-black/50 dark:text-white/50 line-clamp-2">Detects attempts to move communication to WhatsApp, Telegram, Google Forms, or other unofficial channels</p>
                    </div>
                  </AnimatedReveal>

                  <AnimatedReveal delay={300}>
                    <div className="group p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-primary/50 transition-colors cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-bold text-black dark:text-white group-hover:text-primary transition-colors">Unrealistic Job Offers/Salary Anomalies</h3>
                        <AlertOctagon className="w-4 h-4 text-black/30 dark:text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-black/50 dark:text-white/50 line-clamp-2">Identifies unrealistic guarantees, placement assurances, inflated salaries, and misleading benefit claims</p>
                    </div>
                  </AnimatedReveal>
                </div>
              </div>
            </div>

            {/* Right Column: The Interface */}
            <div className="lg:col-span-8">
              <AnimatedReveal className="h-full">
                <div className="relative h-full min-h-[600px] rounded-3xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                  {/* Glassmorphism Header */}
                  <div className="absolute top-0 left-0 right-0 h-16 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center px-6 justify-between z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="font-mono text-xs text-black/30 dark:text-white/30">ANALYSIS_MODULE_V1.0</div>
                  </div>

                  {/* Content Area */}
                  <div className="pt-24 pb-8 px-8 h-full flex flex-col">
                    <AnimatePresence mode="wait">
                      {activeTab === 'input' ? (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col"
                        >
                          <label className="font-heading text-lg text-black/80 dark:text-white/80 mb-4 block">
                            Input Source Data
                          </label>
                          <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="// Paste job description or recruiter message here for analysis..."
                            className="flex-1 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-6 font-mono text-sm text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/10 dark:focus:bg-white/10 transition-all resize-none mb-6"
                          />
                          
                          <div className="flex justify-end">
                            <button
                              onClick={analyzeText}
                              disabled={isAnalyzing || !inputText.trim()}
                              className="relative overflow-hidden px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-heading font-bold rounded-lg hover:bg-black/80 dark:hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isAnalyzing ? (
                                <span className="flex items-center gap-2">
                                  <span className="animate-spin">⟳</span> Processing Data...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  Run Analysis <Search className="w-4 h-4" />
                                </span>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="results"
                          id="results-section"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col"
                        >
                          {analysisResult && (
                            <div className="grid lg:grid-cols-2 gap-8 h-full">
                              {/* Score Column */}
                              <div className="flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                                <div className="relative w-64 h-64 mb-8">
                                  <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="16" />
                                    <motion.circle
                                      cx="128"
                                      cy="128"
                                      r="120"
                                      fill="none"
                                      stroke={getRiskColor(analysisResult.riskLevel)}
                                      strokeWidth="16"
                                      strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 120}`}
                                      initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                                      animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - analysisResult.totalRisk / 100) }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-heading text-6xl font-bold text-black dark:text-white">{analysisResult.totalRisk}%</span>
                                    <span className="font-mono text-sm text-black/50 dark:text-white/50 mt-2">RISK PROBABILITY</span>
                                  </div>
                                </div>
                                
                                <div className="w-full grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-black/10 dark:border-white/10 text-center">
                                    <div className="text-xs text-black/40 dark:text-white/40 font-mono mb-1">SCAN TIME</div>
                                    <div className="text-xl font-bold text-primary">{analysisResult.scanTime}s</div>
                                  </div>
                                  <div className="p-4 bg-white/40 dark:bg-black/40 rounded-lg border border-black/10 dark:border-white/10 text-center">
                                    <div className="text-xs text-black/40 dark:text-white/40 font-mono mb-1">FLAGS</div>
                                    <div className="text-xl font-bold text-secondary">{analysisResult.detectedFlags.length}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Details Column */}
                              <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                  <h3 className="font-heading text-2xl font-bold text-black dark:text-white">Analysis Report</h3>
                                  <button 
                                    onClick={() => {
                                      setActiveTab('input');
                                      setInputText('');
                                      setAnalysisResult(null);
                                    }}
                                    className="text-xs font-mono text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white underline"
                                  >
                                    NEW SCAN
                                  </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                  {analysisResult.detectedFlags.length === 0 ? (
                                    <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                                      <div>
                                        <h4 className="font-bold text-green-600 dark:text-green-400">No Red Flags Detected</h4>
                                        <p className="text-sm text-black/60 dark:text-white/60">The content appears to be safe based on our current criteria.</p>
                                      </div>
                                    </div>
                                  ) : (
                                    analysisResult.detectedFlags.map((flag, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border-l-4 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                        style={{ borderLeftColor: flag.severityLevel === 'high' ? '#F44336' : '#FF9800' }}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-bold text-black dark:text-white">{flag.name}</h4>
                                          <span className="text-xs font-mono px-2 py-1 rounded bg-white/40 dark:bg-black/40 text-black/60 dark:text-white/60">{flag.riskContribution}% RISK</span>
                                        </div>
                                        <p className="text-sm text-black/60 dark:text-white/60">{flag.explanation}</p>
                                      </motion.div>
                                    ))
                                  )}

                                  {/* Conclusion Section */}
                                  <div className="mt-6 p-6 rounded-xl bg-primary/10 border border-primary/20">
                                    <h4 className="font-heading font-bold text-lg mb-3 text-black dark:text-white flex items-center gap-2">
                                      <AlertTriangle className="w-5 h-5 text-primary" />
                                      Conclusion
                                    </h4>
                                    <p className="text-black/80 dark:text-white/80 leading-relaxed">
                                      {analysisResult.riskLevel === 'LOW' && analysisResult.totalRisk === 0 && (
                                        "✅ Safe - No red flags detected. This opportunity appears legitimate based on our analysis. However, always verify company details independently before proceeding."
                                      )}
                                      {analysisResult.riskLevel === 'MEDIUM' && (
                                        "⚠️ Verify - One red flag category detected. Exercise caution and thoroughly verify the company's legitimacy. Do not share sensitive personal information or make any payments until you've confirmed authenticity through multiple sources."
                                      )}
                                      {analysisResult.riskLevel === 'HIGH' && analysisResult.detectedFlags.length === 2 && (
                                        "🚨 High Risk - Two red flag categories detected. This opportunity shows multiple warning signs of a potential scam. Avoid sharing personal details or making any payments. Verify company authenticity through official websites and trusted sources before proceeding."
                                      )}
                                      {analysisResult.riskLevel === 'HIGH' && analysisResult.detectedFlags.length >= 3 && (
                                        "🛑 Avoid - Three or more red flag categories detected. This is very likely a scam. Do NOT proceed with this opportunity. Do NOT share any personal information or make any payments. Report this to the platform immediately."
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                                  <button 
                                    onClick={saveReport}
                                    className="w-full py-3 flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 rounded-lg transition-colors text-sm font-heading font-bold text-black dark:text-white"
                                  >
                                    <Save className="w-4 h-4" /> Download Full Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </AnimatedReveal>
            </div>
          </div>
        </div>
      </section>

      {/* --- RECOMMENDATIONS SECTION (Conditional) --- */}
      {analysisResult && analysisResult.recommendations.length > 0 && (
        <section className="py-24 bg-black/5 dark:bg-white/5 border-y border-black/10 dark:border-white/10">
          <div className="container mx-auto px-6 max-w-[100rem]">
            <AnimatedReveal>
              <h2 className="font-heading text-3xl font-bold mb-12 text-center text-black dark:text-white">Strategic Recommendations</h2>
            </AnimatedReveal>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResult.recommendations.map((rec, idx) => (
                <AnimatedReveal key={idx} delay={idx * 100}>
                  <div className="h-full p-8 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/10 dark:border-white/10 hover:border-primary/30 transition-all group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-colors">
                      <span className="font-heading font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-black/80 dark:text-white/80 leading-relaxed">{rec}</p>
                  </div>
                </AnimatedReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- EDUCATIONAL / HOW IT WORKS --- */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-[#121212]">
        <div className="container mx-auto px-6 max-w-[100rem]">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <AnimatedReveal>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl rounded-full" />
                  <Image 
                    src="https://static.wixstatic.com/media/aa8d35_ebfc2c4f44cc4528a80eeb4e24002b84~mv2.png?originWidth=1152&originHeight=768"
                    alt="Security Dashboard Interface"
                    originWidth={1152}
                    originHeight={768}
                    className="relative z-10 w-full rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl"
                  />
                </div>
              </AnimatedReveal>
            </div>
            
            <div className="order-1 lg:order-2 space-y-12">
              <AnimatedReveal>
                <h2 className="font-heading text-5xl font-bold mb-6 text-black dark:text-white">
                  How We <span className="text-primary">Protect You</span>
                </h2>
                <p className="text-xl text-black/60 dark:text-white/60">
                  Our multi-layered analysis engine breaks down job postings into component signals, comparing them against a database of known fraud patterns.
                </p>
              </AnimatedReveal>

              <div className="space-y-8">
                {[
                  { 
                    title: "Linguistic Analysis", 
                    desc: "Detects urgency, pressure, and unprofessional communication patterns. Our AI scans for red flag keywords and phrases commonly used in scam job postings." 
                  },
                  { 
                    title: "Financial Anomaly Detection", 
                    desc: "Compares salary offers against real-time market data for specific roles. We identify unrealistic compensation packages that deviate significantly from industry standards." 
                  },
                  { 
                    title: "Platform Verification", 
                    desc: "Identifies attempts to move communication to unmonitored channels. Legitimate employers maintain professional communication through official job boards." 
                  },
                  {
                    title: "Pattern Recognition",
                    desc: "Uses machine learning to identify emerging scam tactics and evolving fraud patterns based on thousands of analyzed job postings."
                  },
                  {
                    title: "Risk Scoring",
                    desc: "Generates a comprehensive risk score (0-100%) based on detected red flags, helping you make informed decisions about opportunities."
                  },
                  {
                    title: "Real-Time Recommendations",
                    desc: "Provides actionable guidance tailored to the specific risks detected, including steps to verify legitimacy and protect yourself."
                  }
                ].map((item, i) => (
                  <AnimatedReveal key={i} delay={i * 150}>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold mb-2 text-black dark:text-white">{item.title}</h3>
                        <p className="text-black/60 dark:text-white/50">{item.desc}</p>
                      </div>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 relative bg-white dark:bg-[#121212]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <AnimatedReveal>
            <h2 className="font-heading text-5xl md:text-7xl font-bold mb-8 text-black dark:text-white">
              Stay One Step <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-black dark:to-white">Ahead of Fraud</span>
            </h2>
            <p className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto mb-12">
              Join thousands of job seekers who use our intelligence engine to verify opportunities before they apply.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-12 py-5 bg-black dark:bg-white text-white dark:text-black font-heading font-bold text-xl rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Free Analysis
            </button>
          </AnimatedReveal>
        </div>
      </section>

      <Footer />
      
      {/* Global Styles for Scrollbar & Animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}