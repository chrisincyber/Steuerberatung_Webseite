declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, CSSProperties } from 'react'

  interface ProjectionConfig {
    center?: [number, number]
    scale?: number
    rotate?: [number, number, number]
  }

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: ProjectionConfig
    width?: number
    height?: number
    style?: CSSProperties
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    minZoom?: number
    maxZoom?: number
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void
    translateExtent?: [[number, number], [number, number]]
    children?: ReactNode
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type GeoFeature = any

  interface GeographiesChildrenArgs {
    geographies: GeoFeature[]
  }

  interface GeographiesProps {
    geography: string | object
    children: (args: GeographiesChildrenArgs) => ReactNode
  }

  interface GeographyStyleProps {
    default?: CSSProperties
    hover?: CSSProperties
    pressed?: CSSProperties
  }

  interface GeographyProps {
    geography: GeoFeature
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: GeographyStyleProps
    onMouseEnter?: (event: React.MouseEvent) => void
    onMouseLeave?: (event: React.MouseEvent) => void
    onClick?: (event: React.MouseEvent) => void
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
}
