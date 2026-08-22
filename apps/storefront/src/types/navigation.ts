export interface NavLinkItem {
  label: string;
  href: string;
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
}

export interface NavSubcategoryGroup {
  title: string;
  items: NavLinkItem[];
}

export interface NavFeaturedItem {
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  badge?: string;
}

export interface NavCategory {
  id: string;
  handle: string;
  name: string;
  href: string;
  badge?: string;
  groups: NavSubcategoryGroup[];
  featured?: NavFeaturedItem[];
}
