import { Service } from "../../models/Service";
import { User } from "../../models/User";
import { logger } from "../../lib/logger";

const defaultServices = [
  {
    title: "WhatsApp Bot Setup",
    description: "Professional WhatsApp automation bot for your business. Handle customer inquiries, send automated responses, and manage leads 24/7.",
    price: 299,
    features: ["Automated responses", "Lead capture", "Message broadcasting", "Analytics dashboard", "Multi-user support"],
    icon: "MessageSquare",
    category: "Automation",
    popular: true,
  },
  {
    title: "Social Media Management",
    description: "Complete social media presence management across all platforms. Content creation, scheduling, engagement, and growth strategies.",
    price: 199,
    features: ["Content creation", "Post scheduling", "Engagement monitoring", "Monthly reports", "3 platforms included"],
    icon: "Share2",
    category: "Marketing",
    popular: false,
  },
  {
    title: "Website Development",
    description: "Custom, responsive websites built with modern technologies. From landing pages to full e-commerce solutions.",
    price: 999,
    features: ["Custom design", "Mobile responsive", "SEO optimized", "CMS integration", "3 months support"],
    icon: "Globe",
    category: "Development",
    popular: true,
  },
  {
    title: "SEO Optimization",
    description: "Boost your search engine rankings with proven SEO strategies. Technical SEO, content optimization, and link building.",
    price: 149,
    features: ["Keyword research", "On-page SEO", "Technical audit", "Monthly reports", "Competitor analysis"],
    icon: "TrendingUp",
    category: "Marketing",
    popular: false,
  },
  {
    title: "Telegram Bot Development",
    description: "Custom Telegram bots for business automation, customer service, and community management.",
    price: 249,
    features: ["Custom commands", "Payment integration", "Admin panel", "Analytics", "Unlimited users"],
    icon: "Send",
    category: "Automation",
    popular: false,
  },
  {
    title: "E-commerce Setup",
    description: "Full e-commerce store setup with payment gateway integration, inventory management, and order processing.",
    price: 799,
    features: ["Product catalog", "Payment gateway", "Inventory management", "Order tracking", "Customer portal"],
    icon: "ShoppingCart",
    category: "Development",
    popular: false,
  },
];

export async function seedData(): Promise<void> {
  try {
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(defaultServices);
      logger.info("Default services seeded");
    }

    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = new User({
        name: "Nutterx Admin",
        email: "admin@nutterx.com",
        password: "admin123456",
        role: "admin",
      });
      await admin.save();
      logger.info("Default admin user created: admin@nutterx.com / admin123456");
    }
  } catch (err) {
    logger.error({ err }, "Seed data error");
  }
}
