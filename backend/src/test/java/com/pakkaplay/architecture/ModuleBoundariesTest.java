package com.pakkaplay.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Enforces the modular-monolith rules from ADR-001. Rules allow empty matches so they keep
 * passing while modules are still being filled in, and start biting as soon as code exists.
 */
class ModuleBoundariesTest {

    static final List<String> MODULES = List.of(
            "identity", "sports", "match", "scoring", "statistics", "realtime",
            "social", "community", "events", "notification", "admin");

    static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("com.pakkaplay");
    }

    @Test
    void sharedKernelDoesNotDependOnModules() {
        String[] modulePackages = MODULES.stream().map(m -> "com.pakkaplay." + m + "..").toArray(String[]::new);

        noClasses().that().resideInAPackage("com.pakkaplay.common..")
                .should().dependOnClassesThat().resideInAnyPackage(modulePackages)
                .allowEmptyShould(true)
                .check(classes);
    }

    @Test
    void modulesDoNotReachIntoOtherModulesInfrastructure() {
        for (String module : MODULES) {
            String[] otherInfrastructure = MODULES.stream()
                    .filter(other -> !other.equals(module))
                    .map(other -> "com.pakkaplay." + other + ".infrastructure..")
                    .toArray(String[]::new);

            noClasses().that().resideInAPackage("com.pakkaplay." + module + "..")
                    .should().dependOnClassesThat().resideInAnyPackage(otherInfrastructure)
                    .because("modules talk through application services and events (ADR-001)")
                    .allowEmptyShould(true)
                    .check(classes);
        }
    }

    @Test
    void controllersDoNotUseRepositoriesDirectly() {
        noClasses().that().resideInAPackage("..api..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
                .because("controllers go through application services")
                .allowEmptyShould(true)
                .check(classes);
    }
}
