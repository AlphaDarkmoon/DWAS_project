import { HelpCircle, Upload, Search, FileText, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function Help() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Project",
      description: "Upload your Django project ZIP file using the drag-and-drop interface",
      details: "Ensure your ZIP file contains a complete Django project with requirements.txt and all source code files."
    },
    {
      icon: Search,
      title: "Security Scan",
      description: "DWAS automatically analyzes your code for security vulnerabilities",
      details: "The scanner checks for common security issues, dependency vulnerabilities, and code quality problems."
    },
    {
      icon: FileText,
      title: "Review Results",
      description: "Access detailed reports with vulnerability details and remediation steps",
      details: "View comprehensive reports with severity ratings, affected files, and recommended fixes."
    }
  ]

  const faqs = [
    {
      question: "What types of vulnerabilities does DWAS detect?",
      answer: "DWAS detects a wide range of security vulnerabilities including SQL injection, Cross-Site Scripting (XSS), insecure direct object references, authentication bypasses, configuration issues, and dependency vulnerabilities. It also performs code quality analysis using industry-standard linting tools."
    },
    {
      question: "How long does a security scan take?",
      answer: "Scan duration depends on project size and complexity. Most scans complete within 2-10 minutes. Small projects typically scan in under 3 minutes, while larger applications may take up to 15 minutes."
    },
    {
      question: "What file formats are supported?",
      answer: "DWAS currently supports Django projects packaged as ZIP files. The ZIP should contain your complete Django project structure including Python files, templates, requirements.txt, and configuration files."
    },
    {
      question: "How are vulnerability severities determined?",
      answer: "Vulnerabilities are classified using industry-standard severity levels: Critical (immediate security risk), High (serious security concern), Medium (potential security issue), and Low (minor security improvement). Classifications follow CVSS guidelines."
    },
    {
      question: "Can I integrate DWAS with my CI/CD pipeline?",
      answer: "Yes! DWAS provides API access for integration with continuous integration systems. Generate an API key in Settings and use our REST API to automate security scanning as part of your deployment pipeline."
    },
    {
      question: "How do I fix detected vulnerabilities?",
      answer: "Each vulnerability report includes detailed remediation guidance with code examples and best practices. The scan results provide specific recommendations for fixing issues and links to relevant Django security documentation."
    },
    {
      question: "Is my code secure during scanning?",
      answer: "Yes, DWAS takes security seriously. Your code is processed in isolated environments, encrypted during transmission, and automatically deleted after scanning. We never store your source code permanently."
    },
    {
      question: "What Django versions are supported?",
      answer: "DWAS supports Django versions 2.2 through 5.x. The scanner automatically detects your Django version and applies appropriate security rules and best practices for that version."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how to use DWAS to secure your Django applications with comprehensive security scanning
          </p>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Getting Started with DWAS
            </CardTitle>
            <CardDescription>
              Follow these simple steps to start securing your Django applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{step.details}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-full h-px bg-border transform translate-x-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
            <CardDescription>
              Comprehensive security analysis for Django applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-critical" />
                  Code Vulnerability Analysis
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• SQL Injection detection</li>
                  <li>• Cross-Site Scripting (XSS) analysis</li>
                  <li>• Authentication bypass vulnerabilities</li>
                  <li>• Insecure direct object references</li>
                  <li>• Configuration security issues</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-warning" />
                  Dependency & Quality Analysis
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• CVE database scanning</li>
                  <li>• Outdated package detection</li>
                  <li>• Code quality metrics</li>
                  <li>• PEP 8 compliance checking</li>
                  <li>• Best practices validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions and answers about using DWAS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Additional resources and support options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guides and API reference
                </p>
                <Button variant="outline" size="sm">View Docs</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Community Forum</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other Django developers
                </p>
                <Button variant="outline" size="sm">Join Forum</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Contact Support</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get help from our security experts
                </p>
                <Button variant="outline" size="sm">Contact Us</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}