import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      icon: 'mdi:account-group',
      title: 'Employee Management',
      description: 'Comprehensive employee profile management with all essential details.',
    },
    {
      icon: 'mdi:shield-check',
      title: 'Secure & Reliable',
      description: 'Built with security in mind, ensuring your data is protected.',
    },
    {
      icon: 'mdi:chart-timeline-variant',
      title: 'Easy Tracking',
      description: 'Track employee information and documents effortlessly.',
    },
    {
      icon: 'mdi:cloud-sync',
      title: 'Real-time Sync',
      description: 'Always up-to-date data synchronized across all devices.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      {/* Hero Section */}
      <div className="bg-blue-600 dark:bg-blue-700">
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transform Your HR Management
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Streamline onboarding, manage profiles, and organize HR data in one powerful platform.
            </p>
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                startContent={<Icon icon="mdi:rocket-launch" className="text-xl" />}
              >
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed for modern HR teams
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <CardBody className="p-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon icon={feature.icon} className="text-3xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join companies managing their workforce with HR-Management today
            </p>
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                startContent={<Icon icon="mdi:arrow-right" className="text-xl" />}
              >
                Start Free Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
