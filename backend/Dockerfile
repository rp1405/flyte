# Stage 1: Build the application
FROM maven:3.9-amazoncorretto-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build the app, skipping tests to speed up deployment
RUN mvn clean package -DskipTests

# Stage 2: Run the application
# We switched this to amazoncorretto:17-alpine to fix the "no match for platform" error
FROM amazoncorretto:17-alpine
WORKDIR /app
# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns a random port to the PORT env var. 
# We set a default of 8080, but the app must listen on $PORT.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]