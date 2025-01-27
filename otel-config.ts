import { CompositePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { useEffect, useState } from "react";
import { getLocalhost } from './Localhost.ts'
import { getDeviceId, getSystemVersion, getVersion } from "react-native-device-info";
import { Platform } from "react-native";
import config from 'react-native-config';
// import { SessionIdProcessor } from "@/utils/SessionIdProcessor";

const Tracer = async () => {
  console.log("in tracer code");
//   const localhost = await getLocalhost();
  const resource = new Resource({
    'service.name': "react-native-app-testing",
    'os.name': Platform.OS,
    'os.version': getSystemVersion(),
    'service.version': getVersion(),
    'device.id': getDeviceId(),
  });
  console.log("used service.name, os.name, os.version, service.version, device.id "+Platform.OS+" device.id: "+getDeviceId());

  const endpoint = 'https://dev-otel-collector.kshema.co';
//     const endpoint = 'http://localhost:4318'
  const traceUrl = `${endpoint}/v1/traces`;
  const metricUrl = `${endpoint}/v1/metrics`;
  console.log("called OTEL_EXPORTER_OTLP_ENDPOINT: " + traceUrl);
  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
      new SimpleSpanProcessor(new OTLPTraceExporter({
        url: traceUrl,
//         headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer randomtoken' },
      })),
    ],
  });
  console.log("called OTEL_EXPORTER_OTLP_ENDPOINT: " + traceUrl);

  provider.register({
    propagator: new CompositePropagator({
      propagators: [
        new W3CTraceContextPropagator(),
      ],
    }),
  });

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation(),
    ],
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: metricUrl,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer randomtoken' },
    }),
  });
};

export interface TracerResult {
  loaded: boolean;
}

export const useTracer = (): TracerResult => {
  console.log("in useTracer method");
  const [loaded, setLoaded] = useState<boolean>(false);
  console.log("loaded is set to be false");

  useEffect(() => {
    if (!loaded) {
      Tracer()
        .catch((error) => console.warn("failed to setup tracer: "+error))
        .finally(() => setLoaded(true));
    }
  }, [loaded]);

  return {
    loaded,
  };
};