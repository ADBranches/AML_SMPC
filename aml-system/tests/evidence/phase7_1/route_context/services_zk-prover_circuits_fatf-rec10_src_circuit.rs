use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    pasta::Fp,
    plonk::{Advice, Circuit, Column, ConstraintSystem, Error, Instance, Selector},
};

#[derive(Clone, Debug)]
pub struct Rec10Config {
    pub advice: Column<Advice>,
    pub instance: Column<Instance>,
    pub selector: Selector,
}

#[derive(Default, Clone, Debug)]
pub struct Rec10Circuit {
    pub check_executed: Value<Fp>,
}

impl Circuit<Fp> for Rec10Circuit {
    type Config = Rec10Config;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self {
            check_executed: Value::unknown(),
        }
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        let advice = meta.advice_column();
        let instance = meta.instance_column();
        let selector = meta.selector();

        meta.enable_equality(advice);
        meta.enable_equality(instance);

        Rec10Config {
            advice,
            instance,
            selector,
        }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        let assigned = layouter.assign_region(
            || "rec10 region",
            |mut region| {
                config.selector.enable(&mut region, 0)?;

                let cell = region.assign_advice(
                    || "rec10 check_executed",
                    config.advice,
                    0,
                    || self.check_executed,
                )?;

                Ok(cell)
            },
        )?;

        layouter.constrain_instance(assigned.cell(), config.instance, 0)?;

        Ok(())
    }
}