'use client';

import React, { useState } from 'react';
import {
  Container,
  Section,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  Drawer,
  Dropdown,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  ProductCardSkeleton,
  useToast,
  EmptyState,
  ErrorState,
} from '../components/ui';
import {
  ShoppingBag,
  Sparkles,
  Heart,
  Search,
  Filter,
  CheckCircle,
  MoreVertical,
  Layers,
} from 'lucide-react';

export default function DesignSystemPreviewPage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [radioVal, setRadioVal] = useState('standard');
  const [btnLoading, setBtnLoading] = useState(false);

  const triggerLoading = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success('Action simulated successfully!', 'Completed');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header */}
      <div className="border-b border-gray-200 bg-white py-12">
        <Container size="xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 mb-3 border border-brand-200">
                <Sparkles className="h-3.5 w-3.5" />
                Storefront Design System & Primitives
              </div>
              <Heading level={1} size="2xl">
                Fashion Ecommerce UI Foundation
              </Heading>
              <Text variant="lead" className="mt-2 text-gray-600 max-w-2xl">
                Accessible, India-first fashion ecommerce UI primitives with responsive breakpoints,
                shimmer loading states, and keyboard navigation.
              </Text>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                leftIcon={<ShoppingBag className="h-4 w-4" />}
                onClick={() => setIsDrawerOpen(true)}
              >
                Open Drawer
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Open Dialog
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="space-y-12 pt-10">
        {/* 1. Typography & Badges */}
        <Section spacing="sm">
          <Heading level={2} size="lg" className="mb-4">
            1. Typography & Badges
          </Heading>
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Heading level={1} size="xl">
                    H1: Elegant Ethnic & Western Wear
                  </Heading>
                  <Heading level={2} size="lg">
                    H2: Trending Festive Collections
                  </Heading>
                  <Heading level={3} size="md">
                    H3: Curated Summer Styles
                  </Heading>
                  <Text variant="body">
                    Body text: High quality cotton silhouettes with hand-crafted embroidery and modern
                    tailoring.
                  </Text>
                  <Text variant="muted">
                    Muted text: Free shipping across India on orders above ₹999.
                  </Text>
                </div>
                <div className="space-y-3">
                  <Text weight="semibold">Status & Promotional Badges</Text>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="brand">60% OFF SALE</Badge>
                    <Badge variant="success">IN STOCK</Badge>
                    <Badge variant="warning">FEW LEFT</Badge>
                    <Badge variant="danger">OUT OF STOCK</Badge>
                    <Badge variant="secondary">TRENDING</Badge>
                    <Badge variant="outline">COD AVAILABLE</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* 2. Buttons & Actions */}
        <Section spacing="sm">
          <Heading level={2} size="lg" className="mb-4">
            2. Button Primitives & Interactive States
          </Heading>
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="link">Link Style</Button>
                <Button
                  variant="primary"
                  isLoading={btnLoading}
                  onClick={triggerLoading}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  {btnLoading ? 'Processing...' : 'Simulate Loading'}
                </Button>
                <Button variant="outline" size="icon" aria-label="Favorite">
                  <Heart className="h-4 w-4 text-brand-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* 3. Form Inputs & Controls */}
        <Section spacing="sm">
          <Heading level={2} size="lg" className="mb-4">
            3. Form Inputs & Selection Controls
          </Heading>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Full Name"
                  placeholder="e.g. Priya Sharma"
                  helperText="As mentioned on your delivery address"
                />
                <Input
                  label="Mobile Number"
                  placeholder="+91 98765 43210"
                  leftIcon={<span className="text-xs font-bold text-gray-500">+91</span>}
                />
                <Input
                  label="Promo Code (Error State)"
                  defaultValue="EXPIRED100"
                  error="This coupon code is invalid or has expired."
                />
                <Select
                  label="Select State"
                  options={[
                    { value: 'MH', label: 'Maharashtra' },
                    { value: 'DL', label: 'Delhi NCR' },
                    { value: 'KA', label: 'Karnataka' },
                    { value: 'TN', label: 'Tamil Nadu' },
                  ]}
                />
                <Textarea label="Delivery Instructions (Optional)" placeholder="Landmark or gate code" />
                <div className="space-y-4 pt-1">
                  <Checkbox
                    label="Cash on Delivery (COD)"
                    description="Pay in cash or via UPI QR code upon arrival"
                    defaultChecked
                  />
                  <RadioGroup
                    name="shippingSpeed"
                    label="Shipping Option"
                    value={radioVal}
                    onChange={setRadioVal}
                    options={[
                      { value: 'standard', label: 'Standard Delivery (3-5 Days)', description: 'Free' },
                      { value: 'express', label: 'Express Shipping (1-2 Days)', description: '₹99' },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* 4. Tabs & Cards */}
        <Section spacing="sm">
          <Heading level={2} size="lg" className="mb-4">
            4. Tabs, Shimmer Skeletons & States
          </Heading>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="products">
                <TabsList className="mb-6 max-w-full overflow-x-auto no-scrollbar">
                  <TabsTrigger value="products">Product Cards</TabsTrigger>
                  <TabsTrigger value="skeletons">Shimmer Skeletons</TabsTrigger>
                  <TabsTrigger value="empty">Empty State</TabsTrigger>
                  <TabsTrigger value="error">Error State</TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="aspect-[3/4] bg-gray-100 relative flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-10 w-10 opacity-30" />
                          <Badge variant="brand" className="absolute top-2 left-2">
                            -40%
                          </Badge>
                        </div>
                        <div className="p-3">
                          <Text variant="caption" weight="medium" className="text-gray-500 uppercase">
                            Brand Name
                          </Text>
                          <Text weight="medium" className="text-sm line-clamp-1 mt-0.5">
                            Floral Embroidered Kurta Set
                          </Text>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-bold text-gray-900">₹1,499</span>
                            <span className="text-xs text-gray-400 line-through">₹2,499</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="skeletons">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                    <ProductCardSkeleton />
                  </div>
                </TabsContent>

                <TabsContent value="empty">
                  <EmptyState
                    title="Your Bag is Empty"
                    description="Explore the latest trending fashion arrivals and add items to your cart."
                    actionText="Start Shopping"
                    actionHref="/"
                  />
                </TabsContent>

                <TabsContent value="error">
                  <ErrorState
                    title="Failed to load recommendations"
                    message="We couldn't connect to the product service. Please check your connection and retry."
                    onRetry={() => toast.info('Retrying connection...')}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </Section>
      </Container>

      {/* Modal Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Quick View Modal"
        description="Detailed product specification and variant selector."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Added to Bag!', 'Success');
              }}
            >
              Add to Bag (₹1,499)
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Text variant="body">
            This dialog features accessible focus management, ESC key dismissal, body scroll locking,
            and backdrop blur.
          </Text>
          <div className="rounded-lg bg-gray-50 p-4 border border-gray-100 text-sm space-y-1">
            <p className="font-semibold text-gray-900">Size Guide (India):</p>
            <p className="text-gray-600">S (36), M (38), L (40), XL (42), XXL (44)</p>
          </div>
        </div>
      </Dialog>

      {/* Slide-in Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Shopping Bag (1 Item)"
        description="Items in your bag are reserved for 15 minutes."
        footer={
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-gray-900">₹1,499</span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                setIsDrawerOpen(false);
                toast.success('Proceeding to checkout...');
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 border-b border-gray-100 pb-4">
            <div className="h-20 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">Floral Embroidered Kurta</h4>
              <p className="text-xs text-gray-500">Size: M | Color: Crimson Red</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Qty: 1</span>
                <span className="text-sm font-bold text-gray-900">₹1,499</span>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </main>
  );
}
