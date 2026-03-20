import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bot, Code2, Rocket, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { useGetServices } from "@workspace/api-client-react";

export default function Home() {
  const { data: services, isLoading } = useGetServices();

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Abstract dark tech background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 border-blue-500/30 text-blue-300 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Next-Gen Tech Services
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Transform Your Ideas Into <br className="hidden md:block" />
              <span className="text-gradient-primary">Digital Reality</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Nutterx Technologies provides premium software solutions, WhatsApp bot setups, and custom development services to scale your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto group">
                  Explore Services
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-black/20 backdrop-blur-md">
                  How it works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 bg-black/20 border-y border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4">Our Premium Services</h2>
            <p className="text-muted-foreground">Everything you need to automate and scale.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services?.map((service, i) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    {service.category === 'Bot' ? <Bot className="w-7 h-7 text-blue-400" /> : <Code2 className="w-7 h-7 text-indigo-400" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{service.description}</p>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <span className="text-sm text-muted-foreground">Starting from</span>
                      <div className="text-2xl font-bold text-white">${service.price}</div>
                    </div>
                    <Link href="/auth">
                      <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-primary hover:text-white">
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why choose Nutterx?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We combine cutting-edge technology with elegant design to deliver solutions that simply work better.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Lightning Fast", desc: "Optimized performance across all deliverables." },
                  { icon: ShieldCheck, title: "Secure & Reliable", desc: "Enterprise-grade security built-in from day one." },
                  { icon: Rocket, title: "Scalable Architecture", desc: "Ready to grow as your business expands." }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-3xl rounded-full" />
              <div className="glass-panel p-8 rounded-3xl relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                  <div>
                    <h3 className="text-xl font-bold">Client Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Manage requests seamlessly</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse delay-75" />
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10 mt-6" />
                  <div className="h-24 bg-white/5 rounded-xl border border-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
