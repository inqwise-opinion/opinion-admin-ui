import React from 'react';
import { 
  Box, 
  Typography,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  sx?: any;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, sx = {} }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box 
      className="breadcrumbs" 
      sx={{ 
        mb: 2, 
        ...sx 
      }}
    >
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: '#999',
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast || (!item.path && !item.onClick)) {
            return (
              <Typography
                key={index}
                variant="body1"
                sx={{ 
                  color: isLast ? '#999' : '#324E8D',
                  fontSize: '14px',
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component="button"
              variant="body1"
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item);
              }}
              underline="hover"
              color="inherit"
              sx={{ 
                color: '#324E8D', 
                textDecoration: 'none',
                fontSize: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#f7931e',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
